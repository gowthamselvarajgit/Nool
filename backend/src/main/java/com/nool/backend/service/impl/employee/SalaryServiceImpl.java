package com.nool.backend.service.impl.employee;

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
import com.nool.backend.enums.PaymentMode;
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

    @Override
    public SalaryPaymentResponseDto paySalary(SalaryPaymentRequestDto requestDto) {
        Employee employee = employeeRepository.findById(requestDto.getEmployeeId()).orElseThrow(() -> new RuntimeException("Employee not found"));
        SalaryPayment salaryPayment = SalaryPayment.builder()
                .employee(employee)
                .fromDate(requestDto.getFromDate())
                .toDate(requestDto.getToDate())
                .amountPaid(requestDto.getAmountPaid())
                .paymentMode(PaymentMode.valueOf(requestDto.getPaymentMode()))
                .paymentDate(requestDto.getPaymentDate())
                .remarks(requestDto.getRemarks())
                .build();
        SalaryPayment savedSalaryPayment = salaryPaymentRepository.save(salaryPayment);

        return SalaryPaymentResponseDto.builder()
                .salaryPaymentId(savedSalaryPayment.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .amountPaid(savedSalaryPayment.getAmountPaid())
                .paymentMode(savedSalaryPayment.getPaymentMode().name())
                .paymentDate(savedSalaryPayment.getPaymentDate())
                .fromDate(savedSalaryPayment.getFromDate())
                .toDate(savedSalaryPayment.getToDate())
                .remarks(savedSalaryPayment.getRemarks())
                .build();
    }

    @Override
    public PaginationResponseDto<SalaryPaymentHistoryDto> getSalaryPaymentHistory(Long employeeId, PaginationRequestDto paginationRequestDto) {
        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                paginationRequestDto.getSortBy()
        );

        Page<SalaryPayment> page = salaryPaymentRepository.findByEmployeeId(employeeId, pageRequest);

        List<SalaryPaymentHistoryDto> content = page
                .getContent()
                .stream()
                .map(salaryPayment -> SalaryPaymentHistoryDto
                        .builder()
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

    @Override
    public SalarySummaryDto getSalarySummary(Long employeeId, DateRangeDto dateRangeDto) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        List<EmployeeDailyWork> works = employeeDailyWorkRepository.findByEmployeeIdAndWorkDateBetween(employeeId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        long totalFresh = works
                .stream()
                .mapToLong(EmployeeDailyWork::getFreshCount)
                .sum();

        double totalEarnings = totalFresh * employee.getPolishRate();

        Double totalPaid = salaryPaymentRepository.sumTotalSalaryPaidByEmployee(employeeId);

        double pendingSalary = totalEarnings - totalPaid;

        return SalarySummaryDto.builder()
                .employeeId(employeeId)
                .employeeName(employee.getName())
                .totalEarnings(totalEarnings)
                .totalSalaryPaid(totalPaid)
                .pendingSalary(pendingSalary)
                .build();
    }
}
