package com.nool.backend.dto.dashboard.worker;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class WorkerDashboardSummaryDto {
    private Long employeeId;
    private String employeeName;

    private Long totalWorkDays;
    private Long totalFreshWork;
    private Long totalRePolishWork;

    private Long thisMonthFreshWork;
    private Long thisMonthRePolishWork;
    private Double thisMonthEarnings;

    private Double polishingRate;
    private Double totalEarnings;

    private Double totalSalaryPaid;
    private Double pendingSalary;

    private LocalDate lastPaymentDate;
}
