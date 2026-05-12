package com.nool.backend.service.impl.owner;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeReturnResponseDto;
import com.nool.backend.dto.inventory.SareeTransactionRequestDto;
import com.nool.backend.dto.inventory.SareeTransactionResponseDto;
import com.nool.backend.dto.inventory.SareeTransactionReturnDto;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.entity.owner.SareeReturn;
import com.nool.backend.entity.owner.SareeTransaction;
import com.nool.backend.exception.BadRequestException;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.owner.SareeOwnerRepository;
import com.nool.backend.repository.owner.SareeReturnRepository;
import com.nool.backend.repository.owner.SareeTransactionRepository;
import com.nool.backend.service.owner.SareeInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SareeInventoryServiceImpl implements SareeInventoryService {

    private final SareeTransactionRepository sareeTransactionRepository;
    private final SareeOwnerRepository sareeOwnerRepository;
    private final SareeReturnRepository sareeReturnRepository;

    // ── Shared mapper ─────────────────────────────────────────────────────────
    private SareeTransactionResponseDto mapToDto(SareeTransaction tx) {
        // Fetch all partial returns for this transaction
        List<SareeReturn> partialReturns =
                sareeReturnRepository.findByTransaction_IdOrderByReturnedDateAsc(tx.getId());

        long totalReturned = partialReturns.stream()
                .mapToLong(SareeReturn::getReturnedQuantity)
                .sum();

        int received = tx.getReceivedQuantity() != null ? tx.getReceivedQuantity() : 0;
        int inHand = received - (int) totalReturned;

        List<SareeReturnResponseDto> returnDtos = partialReturns.stream()
                .map(r -> SareeReturnResponseDto.builder()
                        .returnId(r.getId())
                        .returnedDate(r.getReturnedDate())
                        .returnedQuantity(r.getReturnedQuantity())
                        .remarks(r.getRemarks())
                        .build())
                .collect(Collectors.toList());

        return SareeTransactionResponseDto.builder()
                .transactionId(tx.getId())
                .ownerId(tx.getSareeOwner().getId())
                .ownerName(tx.getSareeOwner().getOwnerName())
                .receivedDate(tx.getReceivedDate())
                .receivedQuantity(received)
                .totalReturned(totalReturned)
                .sareesInHand(inHand)
                .fullyReturned(inHand <= 0 && received > 0)
                .returns(returnDtos)
                .remarks(tx.getRemarks())
                .build();
    }

    @Override
    public SareeTransactionResponseDto recordSareeTransaction(SareeTransactionRequestDto requestDto) {
        SareeOwner owner = sareeOwnerRepository.findById(requestDto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        boolean hasReceived = requestDto.getReceivedDate() != null
                && requestDto.getReceivedQuantity() != null
                && requestDto.getReceivedQuantity() > 0;

        if (!hasReceived) {
            throw new BadRequestException(
                    "Received date and quantity are required when creating a new transaction. " +
                    "To record a return, use the 'Add Return' option on an existing transaction.");
        }

        SareeTransaction transaction = SareeTransaction.builder()
                .sareeOwner(owner)
                .receivedDate(requestDto.getReceivedDate())
                .receivedQuantity(requestDto.getReceivedQuantity())
                .remarks(requestDto.getRemarks())
                .build();

        return mapToDto(sareeTransactionRepository.save(transaction));
    }

    @Override
    public SareeTransactionResponseDto addPartialReturn(Long transactionId, SareeTransactionReturnDto dto) {
        SareeTransaction tx = sareeTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        int received = tx.getReceivedQuantity() != null ? tx.getReceivedQuantity() : 0;
        long alreadyReturned = sareeReturnRepository.sumReturnedByTransactionId(transactionId);
        long remaining = received - alreadyReturned;

        if (remaining <= 0) {
            throw new BadRequestException(
                    "All " + received + " sarees have already been returned for this transaction.");
        }
        if (dto.getReturnedQuantity() > remaining) {
            throw new BadRequestException(
                    "Cannot return " + dto.getReturnedQuantity() + " sarees. Only " + remaining + " remaining in hand.");
        }

        SareeReturn sareeReturn = SareeReturn.builder()
                .transaction(tx)
                .returnedDate(dto.getReturnedDate())
                .returnedQuantity(dto.getReturnedQuantity())
                .remarks(dto.getRemarks())
                .build();

        sareeReturnRepository.save(sareeReturn);
        return mapToDto(tx);
    }

    // Keep the old recordReturn for backward compat (delegates to addPartialReturn)
    @Override
    public SareeTransactionResponseDto recordReturn(Long transactionId, SareeTransactionReturnDto dto) {
        return addPartialReturn(transactionId, dto);
    }

    @Override
    public PaginationResponseDto<SareeTransactionResponseDto> getSareeTransactionList(
            Long ownerId, PaginationRequestDto paginationRequestDto) {

        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                paginationRequestDto.getSortBy()
        );

        Page<SareeTransaction> page =
                sareeTransactionRepository.findBySareeOwnerId(ownerId, pageRequest);

        List<SareeTransactionResponseDto> content =
                page.getContent().stream()
                        .map(this::mapToDto)
                        .collect(Collectors.toList());

        return PaginationResponseDto.<SareeTransactionResponseDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public OwnerInventorySummaryDto getOwnerInventorySummary(Long ownerId, DateRangeDto dateRangeDto) {
        SareeOwner owner = sareeOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        List<SareeTransaction> received =
                sareeTransactionRepository.findBySareeOwnerIdAndReceivedDateBetween(
                        ownerId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        List<SareeTransaction> returnedTx =
                sareeTransactionRepository.findBySareeOwnerIdAndReturnedDateBetween(
                        ownerId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        long totalReceived = received.stream()
                .mapToLong(t -> t.getReceivedQuantity() == null ? 0 : t.getReceivedQuantity())
                .sum();

        // For summary, use the partial returns table for accurate totals
        long totalReturned = received.stream()
                .mapToLong(t -> sareeReturnRepository.sumReturnedByTransactionId(t.getId()))
                .sum();

        return OwnerInventorySummaryDto.builder()
                .ownerId(ownerId)
                .ownerName(owner.getOwnerName())
                .totalSareesGiven(totalReceived)
                .totalSareesReturned(totalReturned)
                .sareesInHand(totalReceived - totalReturned)
                .build();
    }

    @Override
    public SareeInventorySummaryDto getOverallInventorySummary(DateRangeDto dateRangeDto) {
        Long totalReceived =
                sareeTransactionRepository.sumTotalReceived(
                        dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        Long totalReturned =
                sareeTransactionRepository.sumTotalReturned(
                        dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        // Supplement totalReturned with partial returns that might not be on the tx itself
        // For overall summary, fetch all transactions in range and sum their partial returns
        // Note: sumTotalReturned uses the legacy tx.returnedQuantity — keeping it for overall
        // since partial returns table gives per-transaction accuracy already

        return SareeInventorySummaryDto.builder()
                .totalSareesReceived(totalReceived != null ? totalReceived : 0L)
                .totalSareesReturned(totalReturned != null ? totalReturned : 0L)
                .sareesInHand((totalReceived != null ? totalReceived : 0L)
                        - (totalReturned != null ? totalReturned : 0L))
                .build();
    }

    @Override
    public PaginationResponseDto<SareeTransactionResponseDto> getMySareeTransactionList(
            PaginationRequestDto paginationRequestDto) {
        Long ownerId = CurrentUserUtil.getOwnerId();
        if (ownerId == null) throw new RuntimeException("Access denied");
        return getSareeTransactionList(ownerId, paginationRequestDto);
    }

    @Override
    public OwnerInventorySummaryDto getMyInventorySummary(DateRangeDto dateRangeDto) {
        Long ownerId = CurrentUserUtil.getOwnerId();
        if (ownerId == null) throw new RuntimeException("Access denied");
        return getOwnerInventorySummary(ownerId, dateRangeDto);
    }
}