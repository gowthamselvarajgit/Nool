package com.nool.backend.dto.dashboard.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminLeaveProductivitySummary {

    private Long totalEmployees;
    private Long totalAbsentDays;
    private Long totalPresentDays;

    private Long totalFreshWork;
    private Long totalRePolishWork;

}
