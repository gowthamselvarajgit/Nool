package com.nool.backend.service.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.owner.OwnerDashboardSummaryDto;
import com.nool.backend.dto.dashboard.owner.OwnerInventoryAnalyticsDto;

public interface OwnerDashboardService {
    OwnerDashboardSummaryDto getDashboardSummary(Long ownerId, DateRangeDto dateRangeDto);
    OwnerInventoryAnalyticsDto getInventoryAnalytics(Long ownerId, DateRangeDto dateRangeDto);
}
