package com.nool.backend.dto.dailywork;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeeWorkSummaryDto {
    private Long employeeId;
    private String employeeName;
    private Long totalWorkDays;
    private Long totalFreshCount;
    private Long totalRePolishCount;
    private Double totalRevenue;
}
