package com.nool.backend.dto.dashboard.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardSummaryDto {
    private Long totalEmployees;
    private Long activeEmployees;
    private Long inactiveEmployees;

    private Long todayFreshWork;
    private Long todayRepolishWork;

    private Long monthFreshWork;
    private Long monthRepolishWork;

    private Double todayRevenue;
    private Double monthRevenue;
    private Double totalRevenue;

    private Long totalSareesReceived;
    private Long totalSareesReturned;
    private Long sareesInHand;

    private Double totalSalaryPaid;
    private Double pendingSalary;
}
