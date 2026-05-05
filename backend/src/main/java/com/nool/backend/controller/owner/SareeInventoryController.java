package com.nool.backend.controller.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeTransactionRequestDto;
import com.nool.backend.dto.inventory.SareeTransactionResponseDto;
import com.nool.backend.service.owner.SareeInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class SareeInventoryController {
    private final SareeInventoryService sareeInventoryService;

    @PostMapping("/transaction")
    public SareeTransactionResponseDto recordSareeTransaction(@Valid @RequestBody SareeTransactionRequestDto requestDto){
        return sareeInventoryService.recordSareeTransaction(requestDto);
    }

    @PostMapping("/owner/{ownerId}/transactions")
    public PaginationResponseDto<SareeTransactionResponseDto> getOwnerTransactions(@PathVariable Long ownerId, @RequestBody PaginationRequestDto paginationRequestDto){
        return sareeInventoryService.getSareeTransactionList(ownerId, paginationRequestDto);
    }

    @PostMapping("/owner/{ownerId}/summary")
    public OwnerInventorySummaryDto getOwnerInventorySummary(@PathVariable Long ownerId, @Valid @RequestBody DateRangeDto dateRangeDto){
        return sareeInventoryService.getOwnerInventorySummary(ownerId, dateRangeDto);
    }

    @PostMapping("/summary")
    public SareeInventorySummaryDto getOverallInventorySummary(@Valid @RequestBody DateRangeDto dateRangeDto){
        return sareeInventoryService.getOverallInventorySummary(dateRangeDto);
    }
}
