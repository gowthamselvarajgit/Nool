package com.nool.backend.controller.employee;

import com.nool.backend.dto.attendance.AttendanceListResponseDto;
import com.nool.backend.dto.attendance.AttendanceRequestDto;
import com.nool.backend.dto.attendance.AttendanceResponseDto;
import com.nool.backend.dto.attendance.AttendanceSummaryDto;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.service.employee.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    //✅ ATTENDANCE MARK API – PASSED
    @PostMapping
    public AttendanceResponseDto markAttendance(@Valid @RequestBody AttendanceRequestDto requestDto){
        return attendanceService.markAttendance(requestDto);
    }

    //✅ ATTENDANCE GET API – PASSED
    @GetMapping("/{attendanceId}")
    public AttendanceResponseDto getAttendanceById(@PathVariable Long attendanceId){
        return attendanceService.getAttendanceById(attendanceId);
    }

    //✅ ATTENDANCE LIST API – PASSED
    @PostMapping("/list")
    public PaginationResponseDto<AttendanceListResponseDto> getAttendanceList(@RequestBody PaginationRequestDto paginationRequestDto){
        return attendanceService.getAttendanceList(paginationRequestDto);
    }

    @PostMapping("/my-list")
    public PaginationResponseDto<AttendanceListResponseDto> getMyAttendanceList(@RequestBody PaginationRequestDto paginationRequestDto){
        return attendanceService.getMyAttendanceList(paginationRequestDto);
    }

    //✅ ATTENDANCE SUMMARY API – PASSED
    @PostMapping("/employee/{employeeId}/summary")
    public AttendanceSummaryDto getAttendanceSummary(@PathVariable Long employeeId, @Valid @RequestBody DateRangeDto dateRangeDto){
        return attendanceService.getAttendanceSummaryByEmployee(employeeId, dateRangeDto);
    }

    @PostMapping("/summary")
    public AttendanceSummaryDto getMyAttendanceSummary(@Valid @RequestBody DateRangeDto dateRangeDto){
        return attendanceService.getMyAttendanceSummary(dateRangeDto);
    }
}
