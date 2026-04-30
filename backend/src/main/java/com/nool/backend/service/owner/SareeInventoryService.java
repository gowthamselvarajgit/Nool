package com.nool.backend.service.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeTransactionRequestDto;
import com.nool.backend.dto.inventory.SareeTransactionResponseDto;
import com.nool.backend.repository.owner.SareeTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

public interface SareeInventoryService {
    SareeTransactionResponseDto recordSareeTransaction(SareeTransactionRequestDto requestDto);

    PaginationResponseDto<SareeTransactionResponseDto> getSareeTransactionList(Long ownerId, PaginationRequestDto paginationRequestDto);

    OwnerInventorySummaryDto getOwnerInventorySummary(Long ownerId, DateRangeDto dateRangeDto);

    SareeInventorySummaryDto getOverallInventorySummary(DateRangeDto dateRangeDto);
}
