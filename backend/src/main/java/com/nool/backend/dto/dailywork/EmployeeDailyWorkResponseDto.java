package com.nool.backend.dto.dailywork;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class EmployeeDailyWorkResponseDto {
    private Long workId;
    private Long employeeId;
    private String employeeName;
    private LocalDate workDate;
    private Integer freshCount;
    private Integer rePolishCount;
    private Double todayRevenue;
}
