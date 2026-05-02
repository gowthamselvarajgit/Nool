package com.nool.backend.service.impl.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.admin.AdminEmployeeLeaveProductivityDto;
import com.nool.backend.dto.dashboard.admin.AdminLeaveProductivitySummary;
import com.nool.backend.entity.employee.Attendance;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.entity.employee.EmployeeDailyWork;
import com.nool.backend.enums.AttendanceStatus;
import com.nool.backend.repository.employee.AttendanceRepository;
import com.nool.backend.repository.employee.EmployeeDailyWorkRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.service.dashboard.AdminLeaveProductivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminLeaveProductivityServiceImpl implements AdminLeaveProductivityService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeDailyWorkRepository employeeDailyWorkRepository;

    @Override
    public List<AdminEmployeeLeaveProductivityDto> getEmployeeLeaveProductivity(DateRangeDto dateRangeDto) {

        List<Employee> employees = employeeRepository.findAll();

        return employees.stream()
                .map(employee -> {
                    Long employeeId = employee.getId();
                    long presentDays = attendanceRepository.countByEmployeeIdAndAttendanceDateBetweenAndAttendanceStatus(employeeId, dateRangeDto.getFromDate(), dateRangeDto.getToDate(), AttendanceStatus.PRESENT);
                    List<Attendance> absences = attendanceRepository.findByEmployeeIdAndAttendanceDateBetweenAndAttendanceStatus(employeeId, dateRangeDto.getFromDate(), dateRangeDto.getToDate(), AttendanceStatus.ABSENT);
                    long absentDays = absences.size();
                    List<LocalDate> absentDates = absences.stream().map(Attendance::getAttendanceDate).toList();
                    List<EmployeeDailyWork> works = employeeDailyWorkRepository.findByEmployeeIdAndWorkDateBetween(employeeId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());
                    long totalWorkDays = works.stream()
                            .map(EmployeeDailyWork::getWorkDate)
                            .distinct()
                            .count();
                    long totalFreshWork = works.stream()
                            .mapToLong(EmployeeDailyWork::getFreshCount)
                            .sum();
                    long totalRePolishWork = works.stream()
                            .mapToLong(EmployeeDailyWork::getRePolishCount)
                            .sum();
                    double productivityScore = totalWorkDays == 0 ? 0 : (double) totalFreshWork / totalWorkDays;

                    return AdminEmployeeLeaveProductivityDto.builder()
                            .employeeId(employeeId)
                            .employeeName(employee.getName())
                            .presentDays(presentDays)
                            .absentDates(absentDates)
                            .totalWorkDays(totalWorkDays)
                            .totalFreshWork(totalFreshWork)
                            .totalRePolish(totalRePolishWork)
                            .productivityScore(productivityScore)
                            .build();
                }).toList();
    }

    @Override
    public AdminLeaveProductivitySummary getLeaveProductivitySummary(DateRangeDto dateRangeDto) {
        long totalEmployees = employeeRepository.count();
        long totalPresentDays = attendanceRepository
                .findAll()
                .stream()
                .filter(a -> !a.getAttendanceDate().isBefore(dateRangeDto.getFromDate()) &&
                        !a.getAttendanceDate().isAfter(dateRangeDto.getToDate()) &&
                        a.getAttendanceStatus() == AttendanceStatus.PRESENT)
                .count();
        long totalAbsentDays = attendanceRepository
                .findAll()
                .stream()
                .filter(attendance -> !attendance.getAttendanceDate().isBefore(dateRangeDto.getFromDate()) &&
                        !attendance.getAttendanceDate().isAfter(dateRangeDto.getToDate())&&
                        attendance.getAttendanceStatus() == AttendanceStatus.ABSENT)
                .count();

        long totalFreshWork = employeeDailyWorkRepository
                .findAll()
                .stream()
                .filter(employeeDailyWork -> !employeeDailyWork.getWorkDate().isBefore(dateRangeDto.getFromDate()) &&
                        !employeeDailyWork.getWorkDate().isAfter(dateRangeDto.getToDate()))
                .mapToLong(EmployeeDailyWork::getFreshCount)
                .sum();

        long totalRePolish = employeeDailyWorkRepository
                .findAll()
                .stream()
                .filter(employeeDailyWork -> !employeeDailyWork.getWorkDate().isBefore(dateRangeDto.getFromDate()) &&
                        !employeeDailyWork.getWorkDate().isAfter(dateRangeDto.getToDate()))
                .mapToLong(EmployeeDailyWork::getRePolishCount)
                .sum();

        return AdminLeaveProductivitySummary.builder()
                .totalEmployees(totalEmployees)
                .totalPresentDays(totalPresentDays)
                .totalAbsentDays(totalAbsentDays)
                .totalFreshWork(totalFreshWork)
                .totalRePolishWork(totalRePolish)
                .build();
    }
}
