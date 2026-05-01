package com.nool.backend.dto.dashboard.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class AdminEmployeeLeaveProductivityDto {
    private Long employeeId;
    private String employeeName;

    private Long presentDays;
    private Long absentDays;
    private List<LocalDate> absentDates;

    private Long totalWorkDays;
    private Long totalFreshWork;
    private Long totalRePolish;

    private Double productivityScore;
}
