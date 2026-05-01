package com.nool.backend.service.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.MonthYearRequestDto;
import com.nool.backend.dto.dashboard.worker.WorkerDashboardSummaryDto;
import com.nool.backend.dto.dashboard.worker.WorkerEarningsAnalyticsDto;
import com.nool.backend.dto.dashboard.worker.WorkerLeaveAnalyticsDto;

import java.util.List;

public interface WorkerDashboardService {
    WorkerDashboardSummaryDto getDashboardSummary(Long employeeId, DateRangeDto dateRangeDto);
    List<WorkerEarningsAnalyticsDto> getEarningAnalytics(Long employeeId, DateRangeDto dateRangeDto);
    WorkerEarningsAnalyticsDto getEarningForMonth(Long employeeId, MonthYearRequestDto monthYearRequestDto);
    WorkerLeaveAnalyticsDto getLeaveAnalytics(Long employeeId, DateRangeDto dateRangeDto);
}
