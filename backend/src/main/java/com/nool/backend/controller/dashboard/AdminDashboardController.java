package com.nool.backend.controller.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.MonthYearRequestDto;
import com.nool.backend.dto.dashboard.admin.*;
import com.nool.backend.service.dashboard.AdminDashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final AdminDashboardService adminDashboardService;
    private final AdminLeaveProductivitySummary adminLeaveProductivitySummary;

    @GetMapping("/summary")
    public AdminDashboardSummaryDto getDashboardSummary(){
        return adminDashboardService.getDashboardSummary();
    }

    @PostMapping("/revenue")
    public AdminRevenueAnalyticsDto getRevenueAnalytics(@Valid @RequestBody DateRangeDto dateRangeDto){
        return adminDashboardService.getRevenueAnalytics(dateRangeDto);
    }

    @PostMapping("/revenue/month")
    public AdminRevenueAnalyticsDto getRevenueForMonth(@Valid @RequestBody MonthYearRequestDto monthYearRequestDto){
        return adminDashboardService.getRevenueForMonth(monthYearRequestDto);
    }

    @PostMapping("/workforce")
    public AdminWorkforceAnalyticsDto getWorkforceAnalytics(@Valid @RequestBody DateRangeDto dateRangeDto){
        return adminDashboardService.getWorkforceAnalytics(dateRangeDto);
    }

}
