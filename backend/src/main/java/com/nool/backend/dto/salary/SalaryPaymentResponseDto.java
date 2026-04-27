package com.nool.backend.dto.salary;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SalaryPaymentResponseDto {
    private Long salaryPaymentId;
    private Long employeeId;
    private String employeeName;
    private Double amountPaid;
    private String paymentMode;
    private LocalDate paymentDate;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String remarks;
}
