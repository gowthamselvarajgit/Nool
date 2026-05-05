package com.nool.backend.controller.employee;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.salary.SalaryPaymentHistoryDto;
import com.nool.backend.dto.salary.SalaryPaymentRequestDto;
import com.nool.backend.dto.salary.SalaryPaymentResponseDto;
import com.nool.backend.dto.salary.SalarySummaryDto;
import com.nool.backend.service.employee.SalaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/salary-payments")
@RequiredArgsConstructor
public class SalaryPaymentController {
    private final SalaryService salaryService;

    @PostMapping
    public SalaryPaymentResponseDto paySalary(@Valid @RequestBody SalaryPaymentRequestDto requestDto){
        return salaryService.paySalary(requestDto);
    }

    @PostMapping("/employee/{employeeId}/history")
    public PaginationResponseDto<SalaryPaymentHistoryDto> getSalaryPaymentHistory(@PathVariable Long employeeId, @RequestBody PaginationRequestDto paginationRequestDto){
        return salaryService.getSalaryPaymentHistory(employeeId, paginationRequestDto);
    }

    @PostMapping("/employee/{employeeId}/summary")
    public SalarySummaryDto getSalarySummary(@PathVariable Long employeeId,@Valid @RequestBody DateRangeDto dateRangeDto){
        return salaryService.getSalarySummary(employeeId, dateRangeDto);
    }
}
