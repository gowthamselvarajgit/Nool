package com.nool.backend.dto.dashboard.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeeEarningsTodayDto {
    private Long employeeId;
    private String employeeName;
    private Long freshCount;
    private Long rePolishCount;
    private Double polishRate;
    private Double todayEarnings;
}
