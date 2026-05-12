package com.nool.backend.controller.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeTransactionRequestDto;
import com.nool.backend.dto.inventory.SareeTransactionResponseDto;
import com.nool.backend.dto.inventory.SareeTransactionReturnDto;
import com.nool.backend.service.owner.SareeInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class SareeInventoryController {
    private final SareeInventoryService sareeInventoryService;

    // ── New Receipt ───────────────────────────────────────────────────────────
    @PostMapping("/transaction")
    public SareeTransactionResponseDto recordSareeTransaction(
            @Valid @RequestBody SareeTransactionRequestDto requestDto) {
        return sareeInventoryService.recordSareeTransaction(requestDto);
    }

    // ── Partial Return (POST — creates a new saree_returns row) ──────────────
    @PostMapping("/transaction/{id}/returns")
    public SareeTransactionResponseDto addPartialReturn(
            @PathVariable Long id,
            @Valid @RequestBody SareeTransactionReturnDto dto) {
        return sareeInventoryService.addPartialReturn(id, dto);
    }

    // ── Legacy PATCH return (kept for backward compat) ────────────────────────
    @PatchMapping("/transaction/{id}/return")
    public SareeTransactionResponseDto recordReturn(
            @PathVariable Long id,
            @Valid @RequestBody SareeTransactionReturnDto dto) {
        return sareeInventoryService.recordReturn(id, dto);
    }

    // ── Admin list by owner ───────────────────────────────────────────────────
    @PostMapping("/owner/{ownerId}/transactions")
    public PaginationResponseDto<SareeTransactionResponseDto> getOwnerTransactions(
            @PathVariable Long ownerId,
            @RequestBody PaginationRequestDto paginationRequestDto) {
        return sareeInventoryService.getSareeTransactionList(ownerId, paginationRequestDto);
    }

    @PostMapping("/owner/{ownerId}/summary")
    public OwnerInventorySummaryDto getOwnerInventorySummary(
            @PathVariable Long ownerId,
            @Valid @RequestBody DateRangeDto dateRangeDto) {
        return sareeInventoryService.getOwnerInventorySummary(ownerId, dateRangeDto);
    }

    @PostMapping("/summary")
    public SareeInventorySummaryDto getOverallInventorySummary(
            @Valid @RequestBody DateRangeDto dateRangeDto) {
        return sareeInventoryService.getOverallInventorySummary(dateRangeDto);
    }

    // ── Owner self-service ────────────────────────────────────────────────────
    @PostMapping("/transactions")
    public PaginationResponseDto<SareeTransactionResponseDto> getMyTransactions(
            @RequestBody PaginationRequestDto paginationRequestDto) {
        return sareeInventoryService.getMySareeTransactionList(paginationRequestDto);
    }

    @PostMapping("/my-summary")
    public OwnerInventorySummaryDto getMyInventorySummary(
            @Valid @RequestBody DateRangeDto dateRangeDto) {
        return sareeInventoryService.getMyInventorySummary(dateRangeDto);
    }
}
