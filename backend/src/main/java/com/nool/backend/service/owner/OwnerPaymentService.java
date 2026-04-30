package com.nool.backend.service.owner;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.payment.OwnerPaymentHistoryDto;
import com.nool.backend.dto.payment.OwnerPaymentRequestDto;
import com.nool.backend.dto.payment.OwnerPaymentResponseDto;
import com.nool.backend.dto.payment.OwnerPaymentSummaryDto;

public interface OwnerPaymentService {
    OwnerPaymentResponseDto recordPayment(OwnerPaymentRequestDto requestDto);

    PaginationResponseDto<OwnerPaymentHistoryDto> getPaymentHistory(Long ownerId, PaginationRequestDto paginationRequestDto);

    OwnerPaymentSummaryDto getPaymentSummary(Long ownerId, DateRangeDto dateRangeDto);

}
