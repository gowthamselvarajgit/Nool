package com.nool.backend.service.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeTransactionRequestDto;
import com.nool.backend.dto.inventory.SareeTransactionResponseDto;
import com.nool.backend.dto.inventory.SareeTransactionReturnDto;

public interface SareeInventoryService {

    SareeTransactionResponseDto recordSareeTransaction(SareeTransactionRequestDto requestDto);

    // Adds a partial return row — can be called multiple times until fully returned
    SareeTransactionResponseDto addPartialReturn(Long transactionId, SareeTransactionReturnDto dto);

    // Legacy PATCH compat — delegates to addPartialReturn
    SareeTransactionResponseDto recordReturn(Long transactionId, SareeTransactionReturnDto dto);

    PaginationResponseDto<SareeTransactionResponseDto> getSareeTransactionList(Long ownerId, PaginationRequestDto paginationRequestDto);

    OwnerInventorySummaryDto getOwnerInventorySummary(Long ownerId, DateRangeDto dateRangeDto);

    SareeInventorySummaryDto getOverallInventorySummary(DateRangeDto dateRangeDto);

    PaginationResponseDto<SareeTransactionResponseDto> getMySareeTransactionList(PaginationRequestDto paginationRequestDto);

    OwnerInventorySummaryDto getMyInventorySummary(DateRangeDto dateRangeDto);
}
