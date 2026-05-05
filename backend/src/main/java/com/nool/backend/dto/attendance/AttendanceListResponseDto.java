package com.nool.backend.dto.attendance;

import com.nool.backend.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AttendanceListResponseDto {
    private Long attendanceId;
    private Long employeeId;
    private String employeeName;
    private LocalDate attendanceDate;
    private AttendanceStatus status;
}
