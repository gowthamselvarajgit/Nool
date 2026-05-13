package com.nool.backend.service.impl.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.admin.AdminEmployeeLeaveProductivityDto;
import com.nool.backend.dto.dashboard.admin.AdminLeaveProductivitySummary;
import com.nool.backend.entity.employee.Attendance;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.enums.AttendanceStatus;
import com.nool.backend.repository.employee.AttendanceRepository;
import com.nool.backend.repository.employee.EmployeeDailyWorkRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.service.dashboard.AdminLeaveProductivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminLeaveProductivityServiceImpl implements AdminLeaveProductivityService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeDailyWorkRepository employeeDailyWorkRepository;

    @Override
    public List<AdminEmployeeLeaveProductivityDto> getEmployeeLeaveProductivity(DateRangeDto dateRangeDto) {

        LocalDate fromDate = dateRangeDto.getFromDate();
        LocalDate toDate = dateRangeDto.getToDate();

        // 1 query — all employees.
        List<Employee> employees = employeeRepository.findAll();

        // 1 query — attendance counts grouped by employee + status.
        Map<Long, Map<AttendanceStatus, Long>> attendanceByEmployee = new HashMap<>();
        for (Object[] row : attendanceRepository.aggregateByEmployeeAndStatus(fromDate, toDate)) {
            Long employeeId = (Long) row[0];
            AttendanceStatus status = (AttendanceStatus) row[1];
            Long count = (Long) row[2];
            attendanceByEmployee
                    .computeIfAbsent(employeeId, k -> new HashMap<>())
                    .put(status, count);
        }

        // 1 query — daily-work aggregates grouped by employee.
        Map<Long, long[]> workByEmployee = new HashMap<>();
        for (Object[] row : employeeDailyWorkRepository.aggregateByEmployee(fromDate, toDate)) {
            Long employeeId = (Long) row[0];
            long freshCount = ((Number) row[1]).longValue();
            long rePolishCount = ((Number) row[2]).longValue();
            long workDays = ((Number) row[3]).longValue();
            workByEmployee.put(employeeId, new long[]{freshCount, rePolishCount, workDays});
        }

        // 1 query — all absence rows in range, grouped client-side per employee.
        Map<Long, List<LocalDate>> absentDatesByEmployee = attendanceRepository
                .findByDateRangeAndStatus(fromDate, toDate, AttendanceStatus.ABSENT)
                .stream()
                .collect(Collectors.groupingBy(
                        a -> a.getEmployee().getId(),
                        Collectors.mapping(Attendance::getAttendanceDate, Collectors.toList())
                ));

        List<AdminEmployeeLeaveProductivityDto> result = new ArrayList<>(employees.size());
        for (Employee employee : employees) {
            Long employeeId = employee.getId();
            Map<AttendanceStatus, Long> attendanceCounts = attendanceByEmployee.getOrDefault(employeeId, Map.of());
            long[] work = workByEmployee.getOrDefault(employeeId, new long[]{0, 0, 0});
            long totalFreshWork = work[0];
            long totalRePolishWork = work[1];
            long totalWorkDays = work[2];
            long presentDays = attendanceCounts.getOrDefault(AttendanceStatus.PRESENT, 0L);
            List<LocalDate> absentDates = absentDatesByEmployee.getOrDefault(employeeId, List.of());

            double productivityScore = totalWorkDays == 0 ? 0 : (double) totalFreshWork / totalWorkDays;

            result.add(AdminEmployeeLeaveProductivityDto.builder()
                    .employeeId(employeeId)
                    .employeeName(employee.getName())
                    .presentDays(presentDays)
                    .absentDates(absentDates)
                    .totalWorkDays(totalWorkDays)
                    .totalFreshWork(totalFreshWork)
                    .totalRePolish(totalRePolishWork)
                    .productivityScore(productivityScore)
                    .build());
        }
        return result;
    }

    @Override
    public AdminLeaveProductivitySummary getLeaveProductivitySummary(DateRangeDto dateRangeDto) {
        LocalDate fromDate = dateRangeDto.getFromDate();
        LocalDate toDate = dateRangeDto.getToDate();

        long totalEmployees = employeeRepository.count();
        long totalPresentDays = attendanceRepository.countByDateRangeAndStatus(fromDate, toDate, AttendanceStatus.PRESENT);
        long totalAbsentDays = attendanceRepository.countByDateRangeAndStatus(fromDate, toDate, AttendanceStatus.ABSENT);
        long totalFreshWork = nz(employeeDailyWorkRepository.sumFreshWorkByDateRange(fromDate, toDate));
        long totalRePolish = nz(employeeDailyWorkRepository.sumRePolishWorkByDateRange(fromDate, toDate));

        return AdminLeaveProductivitySummary.builder()
                .totalEmployees(totalEmployees)
                .totalPresentDays(totalPresentDays)
                .totalAbsentDays(totalAbsentDays)
                .totalFreshWork(totalFreshWork)
                .totalRePolishWork(totalRePolish)
                .build();
    }

    private static long nz(Long v) { return v == null ? 0L : v; }
}
