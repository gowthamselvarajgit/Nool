package com.nool.backend.service.impl.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.admin.AdminDashboardSummaryDto;
import com.nool.backend.dto.dashboard.admin.AdminRevenueAnalyticsDto;
import com.nool.backend.dto.dashboard.admin.AdminWorkforceAnalyticsDto;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.entity.employee.EmployeeDailyWork;
import com.nool.backend.enums.AttendanceStatus;
import com.nool.backend.enums.EmployeeStatus;
import com.nool.backend.repository.employee.AttendanceRepository;
import com.nool.backend.repository.employee.EmployeeDailyWorkRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.repository.employee.SalaryPaymentRepository;
import com.nool.backend.repository.owner.SareeTransactionRepository;
import com.nool.backend.service.dashboard.AdminDashboardService;
import com.nool.backend.dto.common.MonthYearRequestDto;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {
    private static final double RATE_PER_SAREE = 70.0;

    private final EmployeeRepository employeeRepository;
    private final EmployeeDailyWorkRepository employeeDailyWorkRepository;
    private final SalaryPaymentRepository salaryPaymentRepository;
    private final SareeTransactionRepository sareeTransactionRepository;
    private final AttendanceRepository attendanceRepository;

    @Override
    public AdminDashboardSummaryDto getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);


        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long inactiveEmployees = employeeRepository.countByStatus(EmployeeStatus.LEFT);

        long todayFreshCount = employeeDailyWorkRepository.sumFreshWorkByDate(today);
        long todayRepolishCount = employeeDailyWorkRepository.sumRePolishWorkByDate(today);

        Long monthFreshWork = employeeDailyWorkRepository.sumFreshWorkByDateRange(startOfMonth, today);
        Long monthRepolishWork = employeeDailyWorkRepository.sumRePolishWorkByDateRange(startOfMonth, today);

        double todayRevenue = todayFreshCount * RATE_PER_SAREE;
        double monthRevenue = monthFreshWork * RATE_PER_SAREE;
        double totalRevenue = monthRevenue;


        Long totalReceived = sareeTransactionRepository.sumTotalReceived(startOfMonth, today);
        Long totalReturned = sareeTransactionRepository.sumTotalReturned(startOfMonth, today);
        long sareesInHand = totalReceived - totalReturned;

        double totalSalaryEarned = calculateTotalSalaryEarned(startOfMonth, today);
        Double totalSalaryPaid = salaryPaymentRepository.sumTotalSalaryPaid();
        double pendingSalary = totalSalaryEarned - totalSalaryPaid;

        return AdminDashboardSummaryDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .todayFreshWork(todayFreshCount)
                .todayRepolishWork(todayRepolishCount)
                .monthFreshWork(monthFreshWork)
                .monthRepolishWork(monthRepolishWork)
                .todayRevenue(todayRevenue)
                .monthRevenue(monthRevenue)
                .totalRevenue(totalRevenue)
                .totalSareesReceived(totalReceived)
                .totalSareesReturned(totalReturned)
                .sareesInHand(sareesInHand)
                .totalSalaryPaid(totalSalaryPaid)
                .pendingSalary(pendingSalary)
                .build();
    }

    @Override
    public AdminRevenueAnalyticsDto getRevenueAnalytics(DateRangeDto dateRangeDto) {

        Long freshWork =
                employeeDailyWorkRepository.sumFreshWorkByDateRange(
                        dateRangeDto.getFromDate(),
                        dateRangeDto.getToDate()
                );

        double revenue = freshWork * RATE_PER_SAREE;

        return AdminRevenueAnalyticsDto.builder()
                .fromDate(dateRangeDto.getFromDate())
                .toDate(dateRangeDto.getToDate())
                .completedSarees(freshWork)
                .totalRevenue(revenue)
                .build();
    }

    @Override
    public AdminRevenueAnalyticsDto getRevenueForMonth(
            MonthYearRequestDto monthYearRequestDto) {

        YearMonth yearMonth = YearMonth.of(
                monthYearRequestDto.getYear(),
                monthYearRequestDto.getMonth()
        );

        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();

        Long freshWork =
                employeeDailyWorkRepository.sumFreshWorkByDateRange(
                        startOfMonth,
                        endOfMonth
                );

        double revenue = freshWork * RATE_PER_SAREE;

        return AdminRevenueAnalyticsDto.builder()
                .fromDate(startOfMonth)
                .toDate(endOfMonth)
                .completedSarees(freshWork)
                .totalRevenue(revenue)
                .build();
    }

    @Override
    public AdminWorkforceAnalyticsDto getWorkforceAnalytics(DateRangeDto dateRangeDto) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long inactiveEmployees = employeeRepository.countByStatus(EmployeeStatus.LEFT);
        long presentToday = attendanceRepository.countByAttendanceDateAndAttendanceStatus(today, AttendanceStatus.PRESENT);
        long absentToday = attendanceRepository.countByAttendanceDateAndAttendanceStatus(today, AttendanceStatus.ABSENT);
        Long freshToday = employeeDailyWorkRepository.sumFreshWorkByDate(today);
        Long rePolishToday = employeeDailyWorkRepository.sumRePolishWorkByDate(today);
        Long totalFreshMonth = employeeDailyWorkRepository.sumFreshWorkByDateRange(startOfMonth,today);
        Long totalRePolishMonth = employeeDailyWorkRepository.sumRePolishWorkByDateRange(startOfMonth,today);

        return AdminWorkforceAnalyticsDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .employeesPresentToday(presentToday)
                .employeesAbsentToday(absentToday)
                .totalFreshWorkToday(freshToday)
                .totalRePolishWorkToday(rePolishToday)
                .totalFreshWorkThisMonth(totalFreshMonth)
                .totalRePolishWorkThisMonth(totalRePolishMonth)
                .build();
    }

    private double calculateTotalSalaryEarned(
            LocalDate fromDate,
            LocalDate toDate
    ){
        List<EmployeeDailyWork> works = employeeDailyWorkRepository.findByWorkDateBetween(fromDate, toDate);

        double totalSalaryEarned = works.stream()
                .collect(Collectors.groupingBy(work -> work.getEmployee().getId(),
                        Collectors.summingLong(EmployeeDailyWork::getFreshCount)
                ))
                .entrySet()
                .stream()
                .mapToDouble(entry -> {
                    Long employeeId = entry.getKey();
                    Long freshCount = entry.getValue();

                    Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
                    return  freshCount * employee.getPolishRate();
                })
                .sum();
        return totalSalaryEarned;
    }
}
