package com.nool.backend.service.impl.owner;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.LedgerEntryRequestDto;
import com.nool.backend.dto.inventory.LedgerEntryResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;
import com.nool.backend.entity.owner.SareeLedgerEntry;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.enums.LedgerEntryType;
import com.nool.backend.exception.BadRequestException;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.owner.SareeLedgerRepository;
import com.nool.backend.repository.owner.SareeOwnerRepository;
import com.nool.backend.service.owner.SareeInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SareeInventoryServiceImpl implements SareeInventoryService {

    private final SareeLedgerRepository sareeLedgerRepository;
    private final SareeOwnerRepository sareeOwnerRepository;

    // ── Mappers ──────────────────────────────────────────────────────────────
    private LedgerEntryResponseDto mapToDto(SareeLedgerEntry entry) {
        return LedgerEntryResponseDto.builder()
                .entryId(entry.getId())
                .ownerId(entry.getSareeOwner().getId())
                .ownerName(entry.getSareeOwner().getOwnerName())
                .entryType(entry.getEntryType())
                .entryDate(entry.getEntryDate())
                .quantity(entry.getQuantity())
                .remarks(entry.getRemarks())
                .build();
    }

    // ── Receipts ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public LedgerEntryResponseDto addReceipt(LedgerEntryRequestDto requestDto) {
        // Pessimistic lock — even receipts hold the owner row briefly so a
        // concurrent return cannot read a stale "received" total.
        SareeOwner owner = sareeOwnerRepository.findByIdForUpdate(requestDto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        validateEntryDate(requestDto.getEntryDate());

        SareeLedgerEntry entry = SareeLedgerEntry.builder()
                .sareeOwner(owner)
                .entryType(LedgerEntryType.RECEIPT)
                .entryDate(requestDto.getEntryDate())
                .quantity(requestDto.getQuantity())
                .remarks(requestDto.getRemarks())
                .build();

        return mapToDto(sareeLedgerRepository.save(entry));
    }

    // ── Returns ──────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public LedgerEntryResponseDto addReturn(LedgerEntryRequestDto requestDto) {
        // Pessimistic lock — serializes concurrent returns against the same owner.
        // Without this, two requests can both read the same "before" totals
        // and both pass validation when only one should.
        SareeOwner owner = sareeOwnerRepository.findByIdForUpdate(requestDto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        validateEntryDate(requestDto.getEntryDate());

        long totalReceived = nz(sareeLedgerRepository.sumQuantityByOwnerAndType(
                owner.getId(), LedgerEntryType.RECEIPT));
        long totalReturned = nz(sareeLedgerRepository.sumQuantityByOwnerAndType(
                owner.getId(), LedgerEntryType.RETURN));
        long inHand = totalReceived - totalReturned;

        if (inHand <= 0) {
            throw new BadRequestException(
                    "No sarees left to return for " + owner.getOwnerName() +
                    ". Current balance is " + inHand + ".");
        }
        if (requestDto.getQuantity() > inHand) {
            throw new BadRequestException(
                    "Cannot return " + requestDto.getQuantity() + " sarees for " +
                    owner.getOwnerName() + ". Only " + inHand + " remaining in hand.");
        }

        SareeLedgerEntry entry = SareeLedgerEntry.builder()
                .sareeOwner(owner)
                .entryType(LedgerEntryType.RETURN)
                .entryDate(requestDto.getEntryDate())
                .quantity(requestDto.getQuantity())
                .remarks(requestDto.getRemarks())
                .build();

        return mapToDto(sareeLedgerRepository.save(entry));
    }

    // ── Owner ledger (admin or self) ─────────────────────────────────────────
    @Override
    public PaginationResponseDto<LedgerEntryResponseDto> getOwnerLedger(
            Long ownerId, PaginationRequestDto paginationRequestDto) {

        assertSelfOrAdmin(ownerId);

        String sortBy = paginationRequestDto.getSortBy();
        if (sortBy == null || sortBy.isBlank() || "createdAt".equals(sortBy)) {
            sortBy = "entryDate";
        }

        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.by(Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()), sortBy)
                        .and(Sort.by(Sort.Direction.DESC, "id"))
        );

        Page<SareeLedgerEntry> page = sareeLedgerRepository.findBySareeOwnerId(ownerId, pageRequest);

        List<LedgerEntryResponseDto> content = page.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PaginationResponseDto.<LedgerEntryResponseDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    // ── Owner summary (admin or self) ────────────────────────────────────────
    @Override
    public OwnerInventorySummaryDto getOwnerInventorySummary(Long ownerId, DateRangeDto dateRangeDto) {
        assertSelfOrAdmin(ownerId);
        SareeOwner owner = sareeOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        long totalReceived = nz(sareeLedgerRepository.sumQuantityByOwnerAndTypeAndDateRange(
                ownerId, LedgerEntryType.RECEIPT, dateRangeDto.getFromDate(), dateRangeDto.getToDate()));
        long totalReturned = nz(sareeLedgerRepository.sumQuantityByOwnerAndTypeAndDateRange(
                ownerId, LedgerEntryType.RETURN, dateRangeDto.getFromDate(), dateRangeDto.getToDate()));

        // Running balance always uses all-time totals (date range only filters the period totals)
        long allTimeReceived = nz(sareeLedgerRepository.sumQuantityByOwnerAndType(ownerId, LedgerEntryType.RECEIPT));
        long allTimeReturned = nz(sareeLedgerRepository.sumQuantityByOwnerAndType(ownerId, LedgerEntryType.RETURN));

        return OwnerInventorySummaryDto.builder()
                .ownerId(ownerId)
                .ownerName(owner.getOwnerName())
                .totalSareesGiven(totalReceived)
                .totalSareesReturned(totalReturned)
                .sareesInHand(allTimeReceived - allTimeReturned)
                .build();
    }

    // ── Overall summary (admin) ──────────────────────────────────────────────
    @Override
    public SareeInventorySummaryDto getOverallInventorySummary(DateRangeDto dateRangeDto) {
        long totalReceived = nz(sareeLedgerRepository.sumQuantityByTypeAndDateRange(
                LedgerEntryType.RECEIPT, dateRangeDto.getFromDate(), dateRangeDto.getToDate()));
        long totalReturned = nz(sareeLedgerRepository.sumQuantityByTypeAndDateRange(
                LedgerEntryType.RETURN, dateRangeDto.getFromDate(), dateRangeDto.getToDate()));

        long allTimeReceived = nz(sareeLedgerRepository.sumQuantityByType(LedgerEntryType.RECEIPT));
        long allTimeReturned = nz(sareeLedgerRepository.sumQuantityByType(LedgerEntryType.RETURN));

        return SareeInventorySummaryDto.builder()
                .totalSareesReceived(totalReceived)
                .totalSareesReturned(totalReturned)
                .sareesInHand(allTimeReceived - allTimeReturned)
                .build();
    }

    // ── Self-service (owner role) ────────────────────────────────────────────
    @Override
    public PaginationResponseDto<LedgerEntryResponseDto> getMyLedger(PaginationRequestDto paginationRequestDto) {
        Long ownerId = CurrentUserUtil.getOwnerId();
        if (ownerId == null) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        return getOwnerLedger(ownerId, paginationRequestDto);
    }

    @Override
    public OwnerInventorySummaryDto getMyInventorySummary(DateRangeDto dateRangeDto) {
        Long ownerId = CurrentUserUtil.getOwnerId();
        if (ownerId == null) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        return getOwnerInventorySummary(ownerId, dateRangeDto);
    }

    // ── All owners inventory list (admin) ────────────────────────────────────
    @Override
    public List<OwnerInventorySummaryDto> getAllOwnersInventory() {
        List<SareeOwner> owners = sareeOwnerRepository.findAll();

        // Single aggregate query: rows of (ownerId, type, sum)
        // Match the enum by .name() so we work whether Hibernate hands back the
        // enum or the underlying String for Object[] projections.
        Map<Long, long[]> totalsByOwner = new HashMap<>();
        for (Object[] row : sareeLedgerRepository.aggregateAllOwnersByType()) {
            Long ownerId = (Long) row[0];
            String typeName = row[1] == null ? "" : row[1].toString();
            long sum = ((Number) row[2]).longValue();
            long[] totals = totalsByOwner.computeIfAbsent(ownerId, k -> new long[2]);
            if (LedgerEntryType.RECEIPT.name().equals(typeName)) totals[0] = sum;
            else if (LedgerEntryType.RETURN.name().equals(typeName)) totals[1] = sum;
        }

        List<OwnerInventorySummaryDto> result = new ArrayList<>(owners.size());
        for (SareeOwner owner : owners) {
            long[] totals = totalsByOwner.getOrDefault(owner.getId(), new long[2]);
            long received = totals[0];
            long returned = totals[1];
            result.add(OwnerInventorySummaryDto.builder()
                    .ownerId(owner.getId())
                    .ownerName(owner.getOwnerName())
                    .totalSareesGiven(received)
                    .totalSareesReturned(returned)
                    .sareesInHand(received - returned)
                    .build());
        }
        return result;
    }

    // ── Delete entry (admin) ─────────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteLedgerEntry(Long entryId) {
        SareeLedgerEntry entry = sareeLedgerRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Ledger entry not found"));

        // Lock the owner row before re-summing so concurrent receipt/return
        // operations can't slip in between our check and the delete.
        Long ownerId = entry.getSareeOwner().getId();
        sareeOwnerRepository.findByIdForUpdate(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        // If deleting a RECEIPT, ensure resulting in-hand for that owner stays >= 0
        if (entry.getEntryType() == LedgerEntryType.RECEIPT) {
            long totalReceived = nz(sareeLedgerRepository.sumQuantityByOwnerAndType(ownerId, LedgerEntryType.RECEIPT));
            long totalReturned = nz(sareeLedgerRepository.sumQuantityByOwnerAndType(ownerId, LedgerEntryType.RETURN));
            long inHandAfterDelete = (totalReceived - entry.getQuantity()) - totalReturned;
            if (inHandAfterDelete < 0) {
                throw new BadRequestException(
                        "Cannot delete this receipt — it would leave the owner's balance at " +
                        inHandAfterDelete + ". Delete some returns first.");
            }
        }

        sareeLedgerRepository.delete(entry);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private void validateEntryDate(java.time.LocalDate date) {
        if (date == null) {
            throw new BadRequestException("Date is required.");
        }
        java.time.LocalDate today = java.time.LocalDate.now();
        if (date.isAfter(today)) {
            throw new BadRequestException(
                    "Date cannot be in the future. Today is " + today + ".");
        }
        // Reject suspiciously old dates (more than 10 years back) — likely a typo.
        if (date.isBefore(today.minusYears(10))) {
            throw new BadRequestException(
                    "Date " + date + " is too far in the past. Please check the year.");
        }
    }

    private void assertSelfOrAdmin(Long ownerId) {
        String role = CurrentUserUtil.getRole();
        if ("ADMIN".equals(role)) return;
        Long caller = CurrentUserUtil.getOwnerId();
        if (caller == null || !caller.equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only view your own inventory");
        }
    }

    private static long nz(Long v) {
        return v == null ? 0L : v;
    }
}
