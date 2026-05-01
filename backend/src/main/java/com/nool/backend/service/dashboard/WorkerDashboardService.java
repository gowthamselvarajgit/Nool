package com.nool.backend.service.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.worker.WorkerDashboardSummaryDto;
import com.nool.backend.dto.dashboard.worker.WorkerEarningsAnalyticsDto;

public interface WorkerDashboardService {
    WorkerDashboardSummaryDto getDashboardSummary(Long employeeId, DateRangeDto dateRangeDto);
    WorkerEarningsAnalyticsDto getEarningAnalytics(Long employeeId, DateRangeDto dateRangeDto);
}
