package com.nool.backend.service.employee;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.dailywork.EmployeeDailyWorkListDto;
import com.nool.backend.dto.dailywork.EmployeeDailyWorkRequestDto;
import com.nool.backend.dto.dailywork.EmployeeWorkSummaryDto;

public interface EmployeeDailyWorkService {
    EmployeeDailyWorkListDto addDailyWork(EmployeeDailyWorkRequestDto requestDto);

    PaginationResponseDto<EmployeeDailyWorkListDto> getDailyWorkList(PaginationRequestDto paginationRequestDto);

    EmployeeWorkSummaryDto getEmployeeWorkSummary(Long employeeId, DateRangeDto dateRangeDto);

}
