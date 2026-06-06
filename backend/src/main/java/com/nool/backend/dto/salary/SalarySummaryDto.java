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

    /**
     * Net advance balance: SUM(COALESCE(advance_amount, 0)) across all this
     * employee's salary payment rows.
     *   Positive  → worker has received an advance (will be deducted from future earnings)
     *   Negative  → workshop owes the worker a settled advance
     *   0 / null  → no advance outstanding (default for legacy data)
     */
    private Double advanceBalance;
}
