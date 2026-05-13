package com.nool.backend.service.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.LedgerEntryRequestDto;
import com.nool.backend.dto.inventory.LedgerEntryResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;

import java.util.List;

public interface SareeInventoryService {

    LedgerEntryResponseDto addReceipt(LedgerEntryRequestDto requestDto);

    LedgerEntryResponseDto addReturn(LedgerEntryRequestDto requestDto);

    PaginationResponseDto<LedgerEntryResponseDto> getOwnerLedger(Long ownerId, PaginationRequestDto paginationRequestDto);

    OwnerInventorySummaryDto getOwnerInventorySummary(Long ownerId, DateRangeDto dateRangeDto);

    SareeInventorySummaryDto getOverallInventorySummary(DateRangeDto dateRangeDto);

    PaginationResponseDto<LedgerEntryResponseDto> getMyLedger(PaginationRequestDto paginationRequestDto);

    OwnerInventorySummaryDto getMyInventorySummary(DateRangeDto dateRangeDto);

    List<OwnerInventorySummaryDto> getAllOwnersInventory();

    void deleteLedgerEntry(Long entryId);
}
