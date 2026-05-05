package com.nool.backend.controller.employee;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.dailywork.EmployeeDailyWorkListDto;
import com.nool.backend.dto.dailywork.EmployeeDailyWorkRequestDto;
import com.nool.backend.dto.dailywork.EmployeeDailyWorkResponseDto;
import com.nool.backend.dto.dailywork.EmployeeWorkSummaryDto;
import com.nool.backend.entity.employee.EmployeeDailyWork;
import com.nool.backend.service.employee.EmployeeDailyWorkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employee-daily-working")
@RequiredArgsConstructor
public class EmployeeDailyWorkController {

    private final EmployeeDailyWorkService employeeDailyWorkService;

    @PostMapping
    public EmployeeDailyWorkListDto addDailyWork(@Valid @RequestBody EmployeeDailyWorkRequestDto requestDto){
        return employeeDailyWorkService.addDailyWork(requestDto);
    }

    @PostMapping("/list")
    public PaginationResponseDto<EmployeeDailyWorkListDto> getDailyWorkList(@RequestBody PaginationRequestDto paginationRequestDto){
        return employeeDailyWorkService.getDailyWorkList(paginationRequestDto);
    }

    @PostMapping("/employee/{employeeId}/summary")
    public EmployeeWorkSummaryDto getEmployeeWorkSummary(@PathVariable Long employeeId, @Valid @RequestBody DateRangeDto dateRangeDto){
        return employeeDailyWorkService.getEmployeeWorkSummary(employeeId, dateRangeDto);
    }
}
