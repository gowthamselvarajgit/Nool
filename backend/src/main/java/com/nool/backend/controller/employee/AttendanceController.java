package com.nool.backend.controller.employee;

import com.nool.backend.dto.attendance.AttendanceListResponseDto;
import com.nool.backend.dto.attendance.AttendanceRequestDto;
import com.nool.backend.dto.attendance.AttendanceResponseDto;
import com.nool.backend.dto.attendance.AttendanceSummaryDto;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.entity.employee.Attendance;
import com.nool.backend.service.employee.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @PostMapping
    public AttendanceResponseDto markAttendance(@Valid @RequestBody AttendanceRequestDto requestDto){
        return attendanceService.markAttendance(requestDto);
    }

    @GetMapping("/{attendanceId}")
    public AttendanceResponseDto getAttendanceById(@PathVariable Long attendanceId){
        return attendanceService.getAttendanceById(attendanceId);
    }

    @PostMapping("/list")
    public PaginationResponseDto<AttendanceListResponseDto> getAttendanceList(@RequestBody PaginationRequestDto paginationRequestDto){
        return attendanceService.getAttendanceList(paginationRequestDto);
    }

    @PostMapping("/employee/{employeeId}/summary")
    public AttendanceSummaryDto getAttendanceSummary(@PathVariable Long employeeId, @Valid @RequestBody DateRangeDto dateRangeDto){
        return attendanceService.getAttendanceSummary(employeeId, dateRangeDto);
    }
}
