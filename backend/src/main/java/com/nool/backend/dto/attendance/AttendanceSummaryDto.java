package com.nool.backend.dto.attendance;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttendanceSummaryDto {
    private Long employeeId;
    private String employeeName;
    private Long totalWorkingDays;
    private Long absentDays;
    private Double attendancePercentage;
}
