package com.nool.backend.controller.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.payment.OwnerPaymentHistoryDto;
import com.nool.backend.dto.payment.OwnerPaymentRequestDto;
import com.nool.backend.dto.payment.OwnerPaymentResponseDto;
import com.nool.backend.dto.payment.OwnerPaymentSummaryDto;
import com.nool.backend.service.owner.OwnerPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/owner-payments")
@RequiredArgsConstructor
public class OwnerPaymentController {
    private final OwnerPaymentService ownerPaymentService;

    //✅ OWNER PAYMENT ADD API – PASSED
    @PostMapping
    public OwnerPaymentResponseDto recordPayment(@Valid @RequestBody OwnerPaymentRequestDto requestDto){
        return ownerPaymentService.recordPayment(requestDto);
    }

    //✅ OWNER PAYMENT HISTORY API – PASSED
    @PostMapping("/owner/{ownerId}/history")
    public PaginationResponseDto<OwnerPaymentHistoryDto> getPaymentHistory(@PathVariable Long ownerId, @RequestBody PaginationRequestDto paginationRequestDto){
        return ownerPaymentService.getPaymentHistory(ownerId, paginationRequestDto);
    }

    //✅ OWNER PAYMENT SUMMARY API – PASSED
    @PostMapping("/owner/{ownerId}/summary")
    public OwnerPaymentSummaryDto getOwnerPaymentSummaryDto(@PathVariable Long ownerId, @Valid @RequestBody DateRangeDto dateRangeDto){
        return ownerPaymentService.getPaymentSummary(ownerId, dateRangeDto);
    }


    @PostMapping("/history")
    public PaginationResponseDto<OwnerPaymentHistoryDto>
    getMyPaymentHistory(@RequestBody PaginationRequestDto paginationRequestDto){

        return ownerPaymentService.getMyPaymentHistory(paginationRequestDto);
    }

    @PostMapping("/summary")
    public OwnerPaymentSummaryDto getMyPaymentSummary(
            @Valid @RequestBody DateRangeDto dateRangeDto){

        return ownerPaymentService.getMyPaymentSummary(dateRangeDto);
    }

    // GET /owner-payments/owners-summary — admin view, all-time per-owner summary
    @GetMapping("/owners-summary")
    public java.util.List<OwnerPaymentSummaryDto> getAllOwnersPaymentSummary() {
        return ownerPaymentService.getAllOwnersPaymentSummary();
    }
}
