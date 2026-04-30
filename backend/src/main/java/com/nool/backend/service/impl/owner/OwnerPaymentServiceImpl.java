package com.nool.backend.service.impl.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.payment.OwnerPaymentHistoryDto;
import com.nool.backend.dto.payment.OwnerPaymentRequestDto;
import com.nool.backend.dto.payment.OwnerPaymentResponseDto;
import com.nool.backend.dto.payment.OwnerPaymentSummaryDto;
import com.nool.backend.entity.owner.OwnerPayment;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.enums.PaymentMode;
import com.nool.backend.repository.owner.OwnerPaymentRepository;
import com.nool.backend.repository.owner.SareeOwnerRepository;
import com.nool.backend.repository.owner.SareeTransactionRepository;
import com.nool.backend.service.owner.OwnerPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerPaymentServiceImpl implements OwnerPaymentService {

    private static final double RATE_PER_SAREE = 70.0;

    private final OwnerPaymentRepository ownerPaymentRepository;
    private final SareeOwnerRepository sareeOwnerRepository;
    private final SareeTransactionRepository sareeTransactionRepository;

    @Override
    public OwnerPaymentResponseDto recordPayment(OwnerPaymentRequestDto requestDto) {
        SareeOwner owner = sareeOwnerRepository.findById(requestDto.getOwnerId()).orElseThrow(() -> new RuntimeException("Owner not found"));

        OwnerPayment payment = OwnerPayment.builder()
                .owner(owner)
                .amountPaid(requestDto.getAmountPaid())
                .paymentMode(PaymentMode.valueOf(requestDto.getPaymentMode()))
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

    @Override
    public PaginationResponseDto<OwnerPaymentHistoryDto> getPaymentHistory(Long ownerId, PaginationRequestDto paginationRequestDto) {
        PageRequest pageRequest = PageRequest.of(
                        paginationRequestDto.getPage(),
                        paginationRequestDto.getSize(),
                        Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                        paginationRequestDto.getSortBy()
                );

        Page<OwnerPayment> page = ownerPaymentRepository.findByOwnerId(ownerId, pageRequest);

        List<OwnerPaymentHistoryDto> content = page
                .getContent()
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

    @Override
    public OwnerPaymentSummaryDto getPaymentSummary(Long ownerId, DateRangeDto dateRangeDto) {

        SareeOwner sareeOwner = sareeOwnerRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("Owner not found"));

        Double totalPaid = ownerPaymentRepository.sumTotalAmountPaidByOwner(ownerId);
        Long totalReturned = sareeTransactionRepository.sumTotalReturned(dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        double totalPayable = totalReturned * RATE_PER_SAREE;
        double pendingAmount = totalPayable - totalPaid;

        return OwnerPaymentSummaryDto.builder()
                .ownerId(ownerId)
                .ownerName(sareeOwner.getOwnerName())
                .totalAmountPayable(totalPayable)
                .totalAmountPaid(totalPaid)
                .pendingAmount(pendingAmount)
                .build();
    }
}
