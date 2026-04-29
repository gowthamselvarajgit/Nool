package com.nool.backend.service.employee;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.salary.SalaryPaymentHistoryDto;
import com.nool.backend.dto.salary.SalaryPaymentRequestDto;
import com.nool.backend.dto.salary.SalaryPaymentResponseDto;
import com.nool.backend.dto.salary.SalarySummaryDto;

public interface SalaryService {
    SalaryPaymentResponseDto paySalary(SalaryPaymentRequestDto requestDto);

    PaginationResponseDto<SalaryPaymentHistoryDto> getSalaryPaymentHistory(Long employeeId, PaginationRequestDto paginationRequestDto);

    SalarySummaryDto getSalarySummary(Long employeeId, DateRangeDto dateRangeDto);
}
