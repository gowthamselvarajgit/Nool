package com.nool.backend.service.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.MonthYearRequestDto;
import com.nool.backend.dto.dashboard.admin.AdminDashboardSummaryDto;
import com.nool.backend.dto.dashboard.admin.AdminRevenueAnalyticsDto;
import com.nool.backend.dto.dashboard.admin.AdminWorkforceAnalyticsDto;

public interface AdminDashboardService {
    AdminDashboardSummaryDto getDashboardSummary();
    AdminRevenueAnalyticsDto getRevenueAnalytics(DateRangeDto dateRangeDto);
    AdminRevenueAnalyticsDto getRevenueForMonth(MonthYearRequestDto monthYearRequestDto);
    AdminWorkforceAnalyticsDto getWorkforceAnalytics(DateRangeDto dateRangeDto);
}
