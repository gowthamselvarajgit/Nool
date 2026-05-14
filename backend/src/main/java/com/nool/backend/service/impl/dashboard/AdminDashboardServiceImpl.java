package com.nool.backend.service.impl.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.admin.AdminDashboardSummaryDto;
import com.nool.backend.dto.dashboard.admin.AdminRevenueAnalyticsDto;
import com.nool.backend.dto.dashboard.admin.AdminWorkforceAnalyticsDto;
import com.nool.backend.dto.dashboard.admin.EmployeeEarningsTodayDto;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.entity.employee.EmployeeDailyWork;
import com.nool.backend.enums.AttendanceStatus;
import com.nool.backend.enums.EmployeeStatus;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.employee.AttendanceRepository;
import com.nool.backend.repository.employee.EmployeeDailyWorkRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.repository.employee.SalaryPaymentRepository;
import com.nool.backend.enums.LedgerEntryType;
import com.nool.backend.repository.owner.SareeLedgerRepository;
import com.nool.backend.repository.owner.SareeOwnerRepository;
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
    private final EmployeeRepository employeeRepository;
    private final EmployeeDailyWorkRepository employeeDailyWorkRepository;
    private final SalaryPaymentRepository salaryPaymentRepository;
    private final SareeLedgerRepository sareeLedgerRepository;
    private final AttendanceRepository attendanceRepository;
    private final SareeOwnerRepository sareeOwnerRepository;

    @Override
    public AdminDashboardSummaryDto getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);


        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long inactiveEmployees = employeeRepository.countByStatus(EmployeeStatus.LEFT);
        long totalOwners = sareeOwnerRepository.count();

        long todayFreshCount = nz(employeeDailyWorkRepository.sumFreshWorkByDate(today));
        long todayRepolishCount = nz(employeeDailyWorkRepository.sumRePolishWorkByDate(today));

        Long monthFreshWork = nz(employeeDailyWorkRepository.sumFreshWorkByDateRange(startOfMonth, today));
        Long monthRepolishWork = nz(employeeDailyWorkRepository.sumRePolishWorkByDateRange(startOfMonth, today));

        // Workshop revenue = sarees returned × that owner's polish rate.
        double todayWorkshopRevenue = nzD(sareeLedgerRepository.sumRevenueByTypeAndDateRange(
                LedgerEntryType.RETURN, today, today));
        double monthWorkshopRevenue = nzD(sareeLedgerRepository.sumRevenueByTypeAndDateRange(
                LedgerEntryType.RETURN, startOfMonth, today));
        double totalWorkshopRevenue = nzD(sareeLedgerRepository.sumRevenueByType(LedgerEntryType.RETURN));

        // Employee wages (workshop's payroll obligation) = fresh × per-employee rate.
        double todayEmployeeWages = calculateTotalSalaryEarned(today, today);
        double monthEmployeeWages = calculateTotalSalaryEarned(startOfMonth, today);

        List<EmployeeEarningsTodayDto> earningsToday = buildEmployeeEarningsToday(today);

        Long totalReceived = nz(sareeLedgerRepository.sumQuantityByTypeAndDateRange(
                LedgerEntryType.RECEIPT, startOfMonth, today));
        Long totalReturned = nz(sareeLedgerRepository.sumQuantityByTypeAndDateRange(
                LedgerEntryType.RETURN, startOfMonth, today));
        long allTimeReceived = nz(sareeLedgerRepository.sumQuantityByType(LedgerEntryType.RECEIPT));
        long allTimeReturned = nz(sareeLedgerRepository.sumQuantityByType(LedgerEntryType.RETURN));
        long sareesInHand = Math.max(allTimeReceived - allTimeReturned, 0);

        Double totalSalaryPaidBoxed = salaryPaymentRepository.sumTotalSalaryPaidByDateRange(startOfMonth, today);
        double totalSalaryPaid = totalSalaryPaidBoxed == null ? 0.0 : totalSalaryPaidBoxed;
        double pendingSalary = Math.max(monthEmployeeWages - totalSalaryPaid, 0);

        return AdminDashboardSummaryDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .totalOwners(totalOwners)
                .todayFreshWork(todayFreshCount)
                .todayRepolishWork(todayRepolishCount)
                .monthFreshWork(monthFreshWork)
                .monthRepolishWork(monthRepolishWork)
                .todayWorkshopRevenue(todayWorkshopRevenue)
                .monthWorkshopRevenue(monthWorkshopRevenue)
                .totalWorkshopRevenue(totalWorkshopRevenue)
                .todayEmployeeWages(todayEmployeeWages)
                .monthEmployeeWages(monthEmployeeWages)
                .employeeEarningsToday(earningsToday)
                .totalSareesReceived(totalReceived)
                .totalSareesReturned(totalReturned)
                .sareesInHand(sareesInHand)
                .totalSalaryPaid(totalSalaryPaid)
                .pendingSalary(pendingSalary)
                .build();
    }

    /** Builds per-employee earnings cards for the dashboard. */
    private List<EmployeeEarningsTodayDto> buildEmployeeEarningsToday(LocalDate day) {
        List<Object[]> rows = employeeDailyWorkRepository.aggregateByEmployee(day, day);
        if (rows.isEmpty()) return java.util.Collections.emptyList();

        // Bulk-load employees in one query, then map.
        List<Long> empIds = rows.stream().map(r -> (Long) r[0]).collect(Collectors.toList());
        java.util.Map<Long, Employee> empById = employeeRepository.findAllById(empIds).stream()
                .collect(Collectors.toMap(Employee::getId, e -> e));

        List<EmployeeEarningsTodayDto> list = new java.util.ArrayList<>(rows.size());
        for (Object[] r : rows) {
            Long empId = (Long) r[0];
            long fresh = ((Number) r[1]).longValue();
            long repolish = ((Number) r[2]).longValue();
            Employee emp = empById.get(empId);
            if (emp == null) continue;
            double rate = emp.getPolishRate() == null ? 0.0 : emp.getPolishRate();
            list.add(EmployeeEarningsTodayDto.builder()
                    .employeeId(empId)
                    .employeeName(emp.getName())
                    .freshCount(fresh)
                    .rePolishCount(repolish)
                    .polishRate(rate)
                    .todayEarnings(fresh * rate)
                    .build());
        }
        list.sort((a, b) -> Double.compare(b.getTodayEarnings(), a.getTodayEarnings()));
        return list;
    }

    private static double nzD(Double v) { return v == null ? 0.0 : v; }

    @Override
    public AdminRevenueAnalyticsDto getRevenueAnalytics(DateRangeDto dateRangeDto) {

        Long freshWork =
                employeeDailyWorkRepository.sumFreshWorkByDateRange(
                        dateRangeDto.getFromDate(),
                        dateRangeDto.getToDate()
                );

        double revenue = calculateTotalSalaryEarned(dateRangeDto.getFromDate(), dateRangeDto.getToDate());

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

        double revenue = calculateTotalSalaryEarned(startOfMonth, endOfMonth);

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

    private static long nz(Long v) {
        return v == null ? 0L : v;
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

                    Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
                    return  freshCount * employee.getPolishRate();
                })
                .sum();
        return totalSalaryEarned;
    }
}
