package com.nool.backend.service.impl.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.MonthYearRequestDto;
import com.nool.backend.dto.dashboard.worker.WorkerDashboardSummaryDto;
import com.nool.backend.dto.dashboard.worker.WorkerEarningsAnalyticsDto;
import com.nool.backend.dto.dashboard.worker.WorkerLeaveAnalyticsDto;
import com.nool.backend.entity.employee.Attendance;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.entity.employee.EmployeeDailyWork;
import com.nool.backend.enums.AttendanceStatus;
import com.nool.backend.repository.employee.AttendanceRepository;
import com.nool.backend.repository.employee.EmployeeDailyWorkRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.repository.employee.SalaryPaymentRepository;
import com.nool.backend.service.dashboard.WorkerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkerDashboardServiceImpl implements WorkerDashboardService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeDailyWorkRepository employeeDailyWorkRepository;
    private final SalaryPaymentRepository salaryPaymentRepository;
    private final AttendanceRepository attendanceRepository;

    @Override
    public WorkerDashboardSummaryDto getDashboardSummary(Long employeeId, DateRangeDto dateRangeDto) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        List<EmployeeDailyWork> works = employeeDailyWorkRepository.findByEmployeeIdAndWorkDateBetween(employeeId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        long totalWorkDays = works.stream()
                .map(EmployeeDailyWork::getWorkDate)
                .distinct()
                .count();

        long totalFreshWork = works.stream()
                .mapToLong(EmployeeDailyWork::getFreshCount)
                .sum();

        long totalRePolish = works.stream()
                .mapToLong(EmployeeDailyWork::getRePolishCount)
                .sum();

        double totalEarnings = totalFreshWork * employee.getPolishRate();

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        List<EmployeeDailyWork> monthWorks = employeeDailyWorkRepository.findByEmployeeIdAndWorkDateBetween(employeeId, startOfMonth, today);

        long thisMonthFreshWork = monthWorks.stream()
                .mapToLong(EmployeeDailyWork::getFreshCount)
                .sum();

        long thisMonthRePolishWork = monthWorks.stream()
                .mapToLong(EmployeeDailyWork::getRePolishCount)
                .sum();



        double thisMonthEarnings = thisMonthFreshWork * employee.getPolishRate();

        Double totalSalaryPaid = salaryPaymentRepository.sumTotalSalaryPaidByEmployee(employeeId);
        double pendingSalary = totalEarnings - totalSalaryPaid;

        LocalDate lastPaymentDate = salaryPaymentRepository.findLastPaymentDateByEmployee(employeeId);

        return WorkerDashboardSummaryDto.builder()
                .employeeId(employeeId)
                .employeeName(employee.getName())
                .totalWorkDays(totalWorkDays)
                .totalFreshWork(totalFreshWork)
                .totalRePolishWork(totalRePolish)
                .thisMonthFreshWork(thisMonthFreshWork)
                .thisMonthRePolishWork(thisMonthRePolishWork)
                .thisMonthEarnings(thisMonthEarnings)
                .polishingRate(employee.getPolishRate())
                .totalEarnings(totalEarnings)
                .totalSalaryPaid(totalSalaryPaid)
                .pendingSalary(pendingSalary)
                .lastPaymentDate(lastPaymentDate)
                .build();
    }

    @Override
    public List<WorkerEarningsAnalyticsDto> getEarningAnalytics(Long employeeId, DateRangeDto dateRangeDto) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        List<EmployeeDailyWork> works = employeeDailyWorkRepository.findByEmployeeIdAndWorkDateBetween(employeeId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());
        Map<LocalDate, List<EmployeeDailyWork>> worksByDate = works.stream()
                .collect(Collectors.groupingBy(EmployeeDailyWork::getWorkDate));

        return worksByDate.entrySet()
                .stream()
                .map(localDateListEntry -> {
                    long freshWork = localDateListEntry
                            .getValue()
                            .stream()
                            .mapToLong(EmployeeDailyWork::getFreshCount)
                            .sum();
                    long rePolishWork = localDateListEntry
                            .getValue()
                            .stream()
                            .mapToLong(EmployeeDailyWork::getRePolishCount)
                            .sum();

                    double earnings = freshWork * employee.getPolishRate();
                    boolean isAbsent = freshWork == 0 && rePolishWork == 0;

                    return WorkerEarningsAnalyticsDto.builder()
                            .date(localDateListEntry.getKey())
                            .freshWorkCount((int)freshWork)
                            .repolishWorkCount((int)rePolishWork)
                            .earning(earnings)
                            .isAbsent(isAbsent)
                            .build();
                })
                .sorted((a,b) -> a.getDate().compareTo(b.getDate())).collect(Collectors.toList());
    }

    @Override
    public WorkerEarningsAnalyticsDto getEarningForMonth(Long employeeId, MonthYearRequestDto monthYearRequestDto) {

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));

        YearMonth yearMonth = YearMonth.of(monthYearRequestDto.getYear(), monthYearRequestDto.getMonth());
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        List<EmployeeDailyWork> works = employeeDailyWorkRepository.findByEmployeeIdAndWorkDateBetween(employeeId, start, end);
        long freshWork = works
                .stream()
                .mapToLong(EmployeeDailyWork::getFreshCount)
                .sum();
        long rePolish = works
                .stream()
                .mapToLong(EmployeeDailyWork::getRePolishCount)
                .sum();
        double earnings = freshWork * employee.getPolishRate();

        return WorkerEarningsAnalyticsDto.builder()
                .date(start)
                .freshWorkCount((int)freshWork)
                .repolishWorkCount((int) rePolish)
                .earning(earnings)
                .isAbsent(freshWork == 0 && rePolish == 0)
                .build();
    }

    @Override
    public WorkerLeaveAnalyticsDto getLeaveAnalytics(Long employeeId, DateRangeDto dateRangeDto) {
        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<Attendance> absences = attendanceRepository.findByEmployeeIdAndAttendanceDateBetweenAndStatus(employeeId, dateRangeDto.getFromDate(), dateRangeDto.getToDate(), AttendanceStatus.ABSENT);
        List<LocalDate> leaveDates = absences.stream()
                .map(Attendance::getAttendanceDate)
                .sorted()
                .collect(Collectors.toList());

        return WorkerLeaveAnalyticsDto.builder()
                .employeeId(employeeId)
                .employeeName(employee.getName())
                .totalLeaveDays((long) leaveDates.size())
                .leaveDates(leaveDates)
                .build();
    }
}
