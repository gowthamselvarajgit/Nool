package com.nool.backend.dto.salary;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SalarySummaryDto {
    private Long employeeId;
    private String employeeName;
    private Double totalEarnings;
    private Double totalSalaryPaid;
    private Double pendingSalary;
}
