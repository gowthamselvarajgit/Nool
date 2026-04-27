package com.nool.backend.dto.dashboard.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminWorkforceAnalyticsDto {
    private Long totalEmployees;
    private Long activeEmployees;
    private Long inactiveEmployees;

    private Long employeesPresentToday;
    private Long employeesAbsentToday;

    private Long totalFreshWorkToday;
    private Long totalRePolishWorkToday;

    private Long totalFreshWorkThisMonth;
    private Long totalRePolishWorkThisMonth;
}
