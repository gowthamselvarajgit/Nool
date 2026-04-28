package com.nool.backend.service.employee;

import com.nool.backend.dto.attendance.AttendanceListResponseDto;
import com.nool.backend.dto.attendance.AttendanceRequestDto;
import com.nool.backend.dto.attendance.AttendanceResponseDto;
import com.nool.backend.dto.attendance.AttendanceSummaryDto;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;

public interface AttendanceService {
    AttendanceResponseDto markAttendance(AttendanceRequestDto requestDto);
    AttendanceResponseDto getAttendanceById(Long attendanceId);
    PaginationResponseDto<AttendanceListResponseDto> getAttendanceList(PaginationRequestDto paginationRequestDto);
    AttendanceSummaryDto getAttendanceSummary(Long employeeId, DateRangeDto dateRangeDto);
}
