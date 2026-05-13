package com.nool.backend.service.impl.employee;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.salary.SalaryPaymentHistoryDto;
import com.nool.backend.dto.salary.SalaryPaymentRequestDto;
import com.nool.backend.dto.salary.SalaryPaymentResponseDto;
import com.nool.backend.dto.salary.SalarySummaryDto;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.entity.employee.EmployeeDailyWork;
import com.nool.backend.entity.employee.SalaryPayment;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.employee.EmployeeDailyWorkRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.repository.employee.SalaryPaymentRepository;
import com.nool.backend.service.employee.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryServiceImpl implements SalaryService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeDailyWorkRepository employeeDailyWorkRepository;
    private final SalaryPaymentRepository salaryPaymentRepository;

    /* =========================
       ✅ PAY SALARY
       ========================= */
    @Override
    public SalaryPaymentResponseDto paySalary(SalaryPaymentRequestDto requestDto) {

        Employee employee = employeeRepository.findById(requestDto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        SalaryPayment salaryPayment = SalaryPayment.builder()
                .employee(employee)
                .fromDate(requestDto.getFromDate())
                .toDate(requestDto.getToDate())
                .amountPaid(requestDto.getAmountPaid())
                .paymentMode(requestDto.getPaymentMode()) // ✅ enum directly
                .paymentDate(requestDto.getPaymentDate())
                .remarks(requestDto.getRemarks())
                .build();

        SalaryPayment saved = salaryPaymentRepository.save(salaryPayment);

        return SalaryPaymentResponseDto.builder()
                .salaryPaymentId(saved.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .amountPaid(saved.getAmountPaid())
                .paymentMode(saved.getPaymentMode().name())
                .paymentDate(saved.getPaymentDate())
                .fromDate(saved.getFromDate())
                .toDate(saved.getToDate())
                .remarks(saved.getRemarks())
                .build();
    }

    /* =========================
       ✅ SALARY PAYMENT HISTORY
       ========================= */
    @Override
    public PaginationResponseDto<SalaryPaymentHistoryDto> getSalaryPaymentHistory(
            Long employeeId,
            PaginationRequestDto paginationRequestDto) {

        assertSelfOrAdmin(employeeId);

        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                paginationRequestDto.getSortBy()
        );

        Page<SalaryPayment> page =
                salaryPaymentRepository.findByEmployeeId(employeeId, pageRequest);

        List<SalaryPaymentHistoryDto> content = page.getContent()
                .stream()
                .map(salaryPayment -> SalaryPaymentHistoryDto.builder()
                        .salaryPaymentId(salaryPayment.getId())
                        .employeeId(salaryPayment.getEmployee().getId())
                        .employeeName(salaryPayment.getEmployee().getName())
                        .amountPaid(salaryPayment.getAmountPaid())
                        .paymentMode(salaryPayment.getPaymentMode().name())
                        .paymentDate(salaryPayment.getPaymentDate())
                        .fromDate(salaryPayment.getFromDate())
                        .toDate(salaryPayment.getToDate())
                        .remarks(salaryPayment.getRemarks())
                        .build())
                .collect(Collectors.toList());

        return PaginationResponseDto.<SalaryPaymentHistoryDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    /* =========================
       ✅ SALARY SUMMARY
       ========================= */
    @Override
    public SalarySummaryDto getSalarySummary(Long employeeId, DateRangeDto dateRangeDto) {

        assertSelfOrAdmin(employeeId);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        List<EmployeeDailyWork> works =
                employeeDailyWorkRepository.findByEmployeeIdAndWorkDateBetween(
                        employeeId,
                        dateRangeDto.getFromDate(),
                        dateRangeDto.getToDate()
                );

        long totalFresh = works.stream()
                .mapToLong(EmployeeDailyWork::getFreshCount)
                .sum();

        double totalEarnings = totalFresh * employee.getPolishRate();

        // ✅ Null-safe paid amount
        Double totalPaidBoxed =
                salaryPaymentRepository.sumTotalSalaryPaidByEmployeeAndDateRange(
                        employeeId,
                        dateRangeDto.getFromDate(),
                        dateRangeDto.getToDate()
                );
        double totalPaid = totalPaidBoxed == null ? 0.0 : totalPaidBoxed;

        // ✅ Pending salary must NEVER be negative
        double pendingSalary = Math.max(totalEarnings - totalPaid, 0);

        return SalarySummaryDto.builder()
                .employeeId(employeeId)
                .employeeName(employee.getName())
                .totalEarnings(totalEarnings)
                .totalSalaryPaid(totalPaid)
                .pendingSalary(pendingSalary)
                .build();
    }

    @Override
    public PaginationResponseDto<SalaryPaymentHistoryDto> getMySalaryPaymentHistory(PaginationRequestDto paginationRequestDto) {
        Long employeeId = CurrentUserUtil.getEmployeeId();
        if (employeeId == null){
            throw new RuntimeException("Access Denied");
        }

        return getSalaryPaymentHistory(employeeId, paginationRequestDto);
    }

    @Override
    public SalarySummaryDto getMySalarySummary(DateRangeDto dateRangeDto) {
        Long employeeId = CurrentUserUtil.getEmployeeId();
        if (employeeId == null){
            throw new RuntimeException("Access Denied");
        }

        return getSalarySummary(employeeId, dateRangeDto);
    }

    /* =========================
       ✅ ALL-EMPLOYEES SALARY SUMMARY (admin)
       ========================= */
    @Override
    public List<SalarySummaryDto> getAllEmployeesSalarySummary() {
        // 1) all employees
        List<Employee> employees = employeeRepository.findAll();

        // 2) all-time fresh totals per employee
        java.util.Map<Long, Long> freshByEmployee = new java.util.HashMap<>();
        for (Object[] row : employeeDailyWorkRepository.aggregateByAllEmployees()) {
            Long empId = (Long) row[0];
            Long fresh = ((Number) row[1]).longValue();
            freshByEmployee.put(empId, fresh);
        }

        // 3) all-time paid sums per employee
        java.util.Map<Long, Double> paidByEmployee = new java.util.HashMap<>();
        for (Object[] row : salaryPaymentRepository.sumPaidByAllEmployees()) {
            Long empId = (Long) row[0];
            Double paid = ((Number) row[1]).doubleValue();
            paidByEmployee.put(empId, paid);
        }

        // 4) build per-employee summaries
        List<SalarySummaryDto> result = new java.util.ArrayList<>(employees.size());
        for (Employee emp : employees) {
            long fresh = freshByEmployee.getOrDefault(emp.getId(), 0L);
            double earnings = fresh * emp.getPolishRate();
            double paid = paidByEmployee.getOrDefault(emp.getId(), 0.0);
            double pending = Math.max(earnings - paid, 0);
            result.add(SalarySummaryDto.builder()
                    .employeeId(emp.getId())
                    .employeeName(emp.getName())
                    .totalEarnings(earnings)
                    .totalSalaryPaid(paid)
                    .pendingSalary(pending)
                    .build());
        }
        return result;
    }

    private void assertSelfOrAdmin(Long employeeId) {
        String role = CurrentUserUtil.getRole();
        if ("ADMIN".equals(role)) return;
        Long caller = CurrentUserUtil.getEmployeeId();
        if (caller == null || !caller.equals(employeeId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only view your own salary records");
        }
    }
}
