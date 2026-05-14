package com.nool.backend.dto.dashboard.admin;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminDashboardSummaryDto {
    private Long totalEmployees;
    private Long activeEmployees;
    private Long inactiveEmployees;
    private Long totalOwners;

    private Long todayFreshWork;
    private Long todayRepolishWork;

    private Long monthFreshWork;
    private Long monthRepolishWork;

    // Workshop revenue = sarees returned to owners × per-owner polish rate.
    // This is what the business actually earns.
    private Double todayWorkshopRevenue;
    private Double monthWorkshopRevenue;
    private Double totalWorkshopRevenue;

    // Employee wages = sum of fresh sarees × that employee's polish rate.
    // This is the workshop's payroll obligation, not revenue.
    private Double todayEmployeeWages;
    private Double monthEmployeeWages;

    // Per-employee earnings today (one card per employee who worked today).
    private List<EmployeeEarningsTodayDto> employeeEarningsToday;

    private Long totalSareesReceived;
    private Long totalSareesReturned;
    private Long sareesInHand;

    private Double totalSalaryPaid;
    private Double pendingSalary;
}
