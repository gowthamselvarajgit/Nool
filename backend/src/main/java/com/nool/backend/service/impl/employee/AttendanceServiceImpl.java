package com.nool.backend.service.impl.employee;

import com.nool.backend.dto.attendance.AttendanceListResponseDto;
import com.nool.backend.dto.attendance.AttendanceRequestDto;
import com.nool.backend.dto.attendance.AttendanceResponseDto;
import com.nool.backend.dto.attendance.AttendanceSummaryDto;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.entity.employee.Attendance;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.enums.AttendanceStatus;
import com.nool.backend.repository.employee.AttendanceRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.service.employee.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    @Override
    public AttendanceResponseDto markAttendance(AttendanceRequestDto requestDto) {
        Employee employee = employeeRepository.findById(requestDto.getEmployeeId()).orElseThrow(() -> new RuntimeException("Employee not found"));
        Attendance attendance = Attendance.builder()
                .employee(employee)
                .attendanceDate(requestDto.getAttendanceDate())
                .attendanceStatus(AttendanceStatus.valueOf(requestDto.getStatus()))
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);

        return AttendanceResponseDto.builder()
                .attendanceId(savedAttendance.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .attendanceDate(savedAttendance.getAttendanceDate())
                .status(savedAttendance.getAttendanceStatus().name())
                .build();
    }

    @Override
    public AttendanceResponseDto getAttendanceById(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId).orElseThrow(()->new RuntimeException("Attendance not found"));

        return AttendanceResponseDto.builder()
                .attendanceId(attendance.getId())
                .employeeId(attendance.getEmployee().getId())
                .employeeName(attendance.getEmployee().getName())
                .attendanceDate(attendance.getAttendanceDate())
                .status(attendance.getAttendanceStatus().name())
                .build();
    }

    @Override
    public PaginationResponseDto<AttendanceListResponseDto> getAttendanceList(PaginationRequestDto paginationRequestDto) {
        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                paginationRequestDto.getSortBy()
                );

        Page<Attendance> page = attendanceRepository.findAll(pageRequest);

        List<AttendanceListResponseDto> content = page
                .getContent()
                .stream().
                map(attendance -> AttendanceListResponseDto
                        .builder()
                        .attendanceId(attendance.getId())
                        .employeeId(attendance.getEmployee().getId())
                        .employeeName(attendance.getEmployee().getName())
                        .attendanceDate(attendance.getAttendanceDate())
                        .status(attendance.getAttendanceStatus().name())
                        .build()).collect(Collectors.toList());
        return PaginationResponseDto.<AttendanceListResponseDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public AttendanceSummaryDto getAttendanceSummary(Long employeeId, DateRangeDto dateRangeDto) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));

        List<Attendance> attendances = attendanceRepository.findEmployeeIdAndAttendanceDateBetween(employeeId, dateRangeDto.getFromDate(),dateRangeDto.getToDate());

        long totalWorkingDays = attendances.size();

        long absentDays = attendances.stream()
                .filter(a -> a.getAttendanceStatus() == AttendanceStatus.ABSENT).count();

        double attendancePercentage = totalWorkingDays == 0 ? 0 : ((double) (totalWorkingDays - absentDays) / totalWorkingDays) * 100;

        return AttendanceSummaryDto.builder()
                .employeeId(employeeId)
                .employeeName(employee.getName())
                .totalWorkingDays(totalWorkingDays)
                .absentDays(absentDays)
                .attendancePercentage(attendancePercentage)
                .build();
    }
}
