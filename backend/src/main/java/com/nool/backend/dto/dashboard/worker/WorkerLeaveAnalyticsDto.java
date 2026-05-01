package com.nool.backend.dto.dashboard.worker;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class WorkerLeaveAnalyticsDto {
    private Long employeeId;
    private String employeeName;
    private Long totalLeaveDays;
    private List<LocalDate> leaveDates;
}
