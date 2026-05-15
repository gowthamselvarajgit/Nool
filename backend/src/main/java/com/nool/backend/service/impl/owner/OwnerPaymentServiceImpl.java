package com.nool.backend.service.impl.owner;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.payment.OwnerPaymentHistoryDto;
import com.nool.backend.dto.payment.OwnerPaymentRequestDto;
import com.nool.backend.dto.payment.OwnerPaymentResponseDto;
import com.nool.backend.dto.payment.OwnerPaymentSummaryDto;
import com.nool.backend.entity.owner.OwnerPayment;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.enums.LedgerEntryType;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.owner.OwnerPaymentRepository;
import com.nool.backend.repository.owner.SareeLedgerRepository;
import com.nool.backend.repository.owner.SareeOwnerRepository;
import com.nool.backend.service.owner.OwnerPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerPaymentServiceImpl implements OwnerPaymentService {

    @Value("${nool.rate-per-saree:70.0}")
    private double ratePerSaree;

    private final OwnerPaymentRepository ownerPaymentRepository;
    private final SareeOwnerRepository sareeOwnerRepository;
    private final SareeLedgerRepository sareeLedgerRepository;

    /* =========================
       ✅ RECORD OWNER PAYMENT
       ========================= */
    @Override
    public OwnerPaymentResponseDto recordPayment(OwnerPaymentRequestDto requestDto) {

        SareeOwner owner = sareeOwnerRepository.findById(requestDto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        OwnerPayment payment = OwnerPayment.builder()
                .owner(owner)
                .amountPaid(requestDto.getAmountPaid())
                .paymentMode(requestDto.getPaymentMode()) // ✅ enum directly (NO valueOf)
                .paymentDate(requestDto.getPaymentDate())
                .remarks(requestDto.getRemarks())
                .build();

        OwnerPayment saved = ownerPaymentRepository.save(payment);

        return OwnerPaymentResponseDto.builder()
                .paymentId(saved.getId())
                .ownerId(owner.getId())
                .ownerName(owner.getOwnerName())
                .amountPaid(saved.getAmountPaid())
                .paymentMode(saved.getPaymentMode().name())
                .paymentDate(saved.getPaymentDate())
                .remarks(saved.getRemarks())
                .build();
    }

    /* =========================
       ✅ OWNER PAYMENT HISTORY
       ========================= */
    @Override
    public PaginationResponseDto<OwnerPaymentHistoryDto> getPaymentHistory(
            Long ownerId,
            PaginationRequestDto paginationRequestDto) {

        assertSelfOrAdmin(ownerId);

        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                paginationRequestDto.getSortBy()
        );

        Page<OwnerPayment> page = ownerPaymentRepository.findByOwnerId(ownerId, pageRequest);

        List<OwnerPaymentHistoryDto> content = page.getContent()
                .stream()
                .map(p -> OwnerPaymentHistoryDto.builder()
                        .paymentId(p.getId())
                        .ownerId(p.getOwner().getId())
                        .ownerName(p.getOwner().getOwnerName())
                        .amountPaid(p.getAmountPaid())
                        .paymentMode(p.getPaymentMode().name())
                        .paymentDate(p.getPaymentDate())
                        .remarks(p.getRemarks())
                        .build())
                .collect(Collectors.toList());

        return PaginationResponseDto.<OwnerPaymentHistoryDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    /* =========================
       ✅ OWNER PAYMENT SUMMARY
       ========================= */
    @Override
    public OwnerPaymentSummaryDto getPaymentSummary(Long ownerId, DateRangeDto dateRangeDto) {

        assertSelfOrAdmin(ownerId);

        SareeOwner owner = sareeOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        // Payable / paid / pending are ALL-TIME totals. Filtering by date range
        // here used to hide returns from earlier periods (or returns whose entryDate
        // landed outside the page's "this month" window), making the owner's
        // pending amount appear stuck at ₹0 after a new return was recorded.
        // Match the admin's getAllOwnersPaymentSummary semantics for consistency.
        Long totalReturnedBoxed = sareeLedgerRepository.sumQuantityByOwnerAndType(
                ownerId, LedgerEntryType.RETURN);
        long totalReturned = totalReturnedBoxed == null ? 0 : totalReturnedBoxed;

        Double totalPaidBoxed = ownerPaymentRepository.sumTotalAmountPaidByOwner(ownerId);
        double totalPaid = totalPaidBoxed == null ? 0.0 : totalPaidBoxed;

        // Owner-configured rate; fall back to global config if unset OR 0
        // (legacy rows can land with rate=0 because the column was added later).
        Double ownerRate = owner.getPolishRatePerSaree();
        double rate = (ownerRate != null && ownerRate > 0) ? ownerRate : ratePerSaree;
        double totalPayable = totalReturned * rate;

        // ✅ NEVER allow negative pending
        double pendingAmount = Math.max(totalPayable - totalPaid, 0);

        return OwnerPaymentSummaryDto.builder()
                .ownerId(ownerId)
                .ownerName(owner.getOwnerName())
                .totalAmountPayable(totalPayable)
                .totalAmountPaid(totalPaid)
                .pendingAmount(pendingAmount)
                .build();
    }

    @Override
    public PaginationResponseDto<OwnerPaymentHistoryDto> getMyPaymentHistory(PaginationRequestDto paginationRequestDto) {
        Long ownerId = CurrentUserUtil.getOwnerId();
        if (ownerId == null){
            throw new RuntimeException("Access denied");
        }

        return getPaymentHistory(ownerId, paginationRequestDto);
    }

    @Override
    public OwnerPaymentSummaryDto getMyPaymentSummary(DateRangeDto dateRangeDto) {
        Long ownerId = CurrentUserUtil.getOwnerId();
        if (ownerId == null){
            throw new RuntimeException("Access Denied");
        }

        return getPaymentSummary(ownerId, dateRangeDto);
    }

    /* =========================
       ✅ ALL OWNERS PAYMENT SUMMARY (admin)
       ========================= */
    @Override
    public List<OwnerPaymentSummaryDto> getAllOwnersPaymentSummary() {
        // 1) all owners
        List<SareeOwner> owners = sareeOwnerRepository.findAll();

        // 2) all-time returned totals per owner (we earn money on returns)
        // Use the toString() form for enum matching — Hibernate can return either
        // the enum or its String representation for Object[] projections of an
        // @Enumerated(EnumType.STRING) column, and a hard `(LedgerEntryType)` cast
        // either misses every RETURN row (string comparison) or throws CCE.
        java.util.Map<Long, Long> returnedByOwner = new java.util.HashMap<>();
        for (Object[] row : sareeLedgerRepository.aggregateAllOwnersByType()) {
            Long ownerId = (Long) row[0];
            String typeName = row[1] == null ? "" : row[1].toString();
            long sum = ((Number) row[2]).longValue();
            if (LedgerEntryType.RETURN.name().equals(typeName)) {
                returnedByOwner.put(ownerId, sum);
            }
        }

        // 3) all-time paid sums per owner
        java.util.Map<Long, Double> paidByOwner = new java.util.HashMap<>();
        for (Object[] row : ownerPaymentRepository.sumPaidByAllOwners()) {
            Long ownerId = (Long) row[0];
            Double paid = ((Number) row[1]).doubleValue();
            paidByOwner.put(ownerId, paid);
        }

        // 4) build per-owner summaries
        List<OwnerPaymentSummaryDto> result = new java.util.ArrayList<>(owners.size());
        for (SareeOwner owner : owners) {
            long returned = returnedByOwner.getOrDefault(owner.getId(), 0L);
            // Rate fallback also catches 0/negative values. Owners created before
            // polish_rate_per_saree existed in the schema can land with a DB-level
            // default of 0, which the Lombok @Builder.Default(70.0) cannot fix
            // for existing rows.
            Double ownerRate = owner.getPolishRatePerSaree();
            double rate = (ownerRate != null && ownerRate > 0) ? ownerRate : ratePerSaree;
            double payable = returned * rate;
            double paid = paidByOwner.getOrDefault(owner.getId(), 0.0);
            double pending = Math.max(payable - paid, 0);
            result.add(OwnerPaymentSummaryDto.builder()
                    .ownerId(owner.getId())
                    .ownerName(owner.getOwnerName())
                    .totalAmountPayable(payable)
                    .totalAmountPaid(paid)
                    .pendingAmount(pending)
                    .build());
        }
        return result;
    }

    private void assertSelfOrAdmin(Long ownerId) {
        String role = CurrentUserUtil.getRole();
        if ("ADMIN".equals(role)) return;
        Long caller = CurrentUserUtil.getOwnerId();
        if (caller == null || !caller.equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only view your own payment records");
        }
    }
}
