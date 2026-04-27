package com.nool.backend.dto.dashboard.worker;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkerDashboardSummaryDto {
    private Long employeeId;
    private String employeeName;

    private Long totalWorkDays;
    private Long totalFreshWork;
    private Long totalRePolishWork;

    private Double totalEarnings;

    private Double totalSalaryPaid;
    private Double pendingSalary;
}
