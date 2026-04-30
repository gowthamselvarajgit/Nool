package com.nool.backend.service.impl.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeTransactionRequestDto;
import com.nool.backend.dto.inventory.SareeTransactionResponseDto;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.entity.owner.SareeTransaction;
import com.nool.backend.repository.owner.SareeOwnerRepository;
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

    @Override
    public SareeTransactionResponseDto recordSareeTransaction(
            SareeTransactionRequestDto requestDto) {

        SareeOwner owner = sareeOwnerRepository.findById(requestDto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        boolean hasReceived =
                requestDto.getReceivedDate() != null &&
                        requestDto.getReceivedQuantity() != null;

        boolean hasReturned =
                requestDto.getReturnedDate() != null &&
                        requestDto.getReturnedQuantity() != null;

        if (!hasReceived && !hasReturned) {
            throw new RuntimeException(
                    "At least received or returned details must be provided");
        }

        SareeTransaction transaction = SareeTransaction.builder()
                .sareeOwner(owner)
                .receivedDate(requestDto.getReceivedDate())
                .receivedQuantity(requestDto.getReceivedQuantity())
                .returnedDate(requestDto.getReturnedDate())
                .returnedQuantity(requestDto.getReturnedQuantity())
                .remarks(requestDto.getRemarks())
                .build();

        SareeTransaction saved = sareeTransactionRepository.save(transaction);

        return SareeTransactionResponseDto.builder()
                .transactionId(saved.getId())
                .ownerId(owner.getId())
                .ownerName(owner.getOwnerName())
                .receivedDate(saved.getReceivedDate())
                .receivedQuantity(saved.getReceivedQuantity())
                .returnedDate(saved.getReturnedDate())
                .returnedQuantity(saved.getReturnedQuantity())
                .remarks(saved.getRemarks())
                .build();
    }

    @Override
    public PaginationResponseDto<SareeTransactionResponseDto> getSareeTransactionList(
            Long ownerId,
            PaginationRequestDto paginationRequestDto) {

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
                        .map(tx -> SareeTransactionResponseDto.builder()
                                .transactionId(tx.getId())
                                .ownerId(tx.getSareeOwner().getId())
                                .ownerName(tx.getSareeOwner().getOwnerName())
                                .receivedDate(tx.getReceivedDate())
                                .receivedQuantity(tx.getReceivedQuantity())
                                .returnedDate(tx.getReturnedDate())
                                .returnedQuantity(tx.getReturnedQuantity())
                                .remarks(tx.getRemarks())
                                .build())
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
    public OwnerInventorySummaryDto getOwnerInventorySummary(
            Long ownerId,
            DateRangeDto dateRangeDto) {

        SareeOwner owner = sareeOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        List<SareeTransaction> received =
                sareeTransactionRepository.findBySareeOwnerIdAndReceivedDateBetween(
                        ownerId,
                        dateRangeDto.getFromDate(),
                        dateRangeDto.getToDate()
                );

        List<SareeTransaction> returned =
                sareeTransactionRepository.findBySareeOwnerIdAndReturnedDateBetween(
                        ownerId,
                        dateRangeDto.getFromDate(),
                        dateRangeDto.getToDate()
                );

        long totalReceived = received.stream()
                .mapToLong(t -> t.getReceivedQuantity() == null ? 0 : t.getReceivedQuantity())
                .sum();

        long totalReturned = returned.stream()
                .mapToLong(t -> t.getReturnedQuantity() == null ? 0 : t.getReturnedQuantity())
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
    public SareeInventorySummaryDto getOverallInventorySummary(
            DateRangeDto dateRangeDto) {

        Long totalReceived =
                sareeTransactionRepository.sumTotalReceived(
                        dateRangeDto.getFromDate(),
                        dateRangeDto.getToDate()
                );

        Long totalReturned =
                sareeTransactionRepository.sumTotalReturned(
                        dateRangeDto.getFromDate(),
                        dateRangeDto.getToDate()
                );

        return SareeInventorySummaryDto.builder()
                .totalSareesReceived(totalReceived)
                .totalSareesReturned(totalReturned)
                .sareesInHand(totalReceived - totalReturned)
                .build();
    }
}