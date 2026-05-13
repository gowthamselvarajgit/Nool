package com.nool.backend.controller.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.inventory.LedgerEntryRequestDto;
import com.nool.backend.dto.inventory.LedgerEntryResponseDto;
import com.nool.backend.dto.inventory.OwnerInventorySummaryDto;
import com.nool.backend.dto.inventory.SareeInventorySummaryDto;
import com.nool.backend.service.owner.SareeInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class SareeInventoryController {

    private final SareeInventoryService sareeInventoryService;

    // ── Add Receipt (admin) ──────────────────────────────────────────────────
    @PostMapping("/receipt")
    public LedgerEntryResponseDto addReceipt(@Valid @RequestBody LedgerEntryRequestDto requestDto) {
        return sareeInventoryService.addReceipt(requestDto);
    }

    // ── Add Return (admin) ───────────────────────────────────────────────────
    @PostMapping("/return")
    public LedgerEntryResponseDto addReturn(@Valid @RequestBody LedgerEntryRequestDto requestDto) {
        return sareeInventoryService.addReturn(requestDto);
    }

    // ── Owner ledger (admin) ─────────────────────────────────────────────────
    @PostMapping("/owner/{ownerId}/ledger")
    public PaginationResponseDto<LedgerEntryResponseDto> getOwnerLedger(
            @PathVariable Long ownerId,
            @RequestBody PaginationRequestDto paginationRequestDto) {
        return sareeInventoryService.getOwnerLedger(ownerId, paginationRequestDto);
    }

    // ── Owner summary (admin) ────────────────────────────────────────────────
    @PostMapping("/owner/{ownerId}/summary")
    public OwnerInventorySummaryDto getOwnerInventorySummary(
            @PathVariable Long ownerId,
            @Valid @RequestBody DateRangeDto dateRangeDto) {
        return sareeInventoryService.getOwnerInventorySummary(ownerId, dateRangeDto);
    }

    // ── Overall summary (admin) ──────────────────────────────────────────────
    @PostMapping("/summary")
    public SareeInventorySummaryDto getOverallInventorySummary(
            @Valid @RequestBody DateRangeDto dateRangeDto) {
        return sareeInventoryService.getOverallInventorySummary(dateRangeDto);
    }

    // ── All owners inventory list (admin) ────────────────────────────────────
    @GetMapping("/owners")
    public List<OwnerInventorySummaryDto> getAllOwnersInventory() {
        return sareeInventoryService.getAllOwnersInventory();
    }

    // ── Delete ledger entry (admin) ──────────────────────────────────────────
    @DeleteMapping("/entry/{id}")
    public void deleteLedgerEntry(@PathVariable Long id) {
        sareeInventoryService.deleteLedgerEntry(id);
    }

    // ── Owner self-service ───────────────────────────────────────────────────
    @PostMapping("/my-ledger")
    public PaginationResponseDto<LedgerEntryResponseDto> getMyLedger(
            @RequestBody PaginationRequestDto paginationRequestDto) {
        return sareeInventoryService.getMyLedger(paginationRequestDto);
    }

    @PostMapping("/my-summary")
    public OwnerInventorySummaryDto getMyInventorySummary(
            @Valid @RequestBody DateRangeDto dateRangeDto) {
        return sareeInventoryService.getMyInventorySummary(dateRangeDto);
    }
}
