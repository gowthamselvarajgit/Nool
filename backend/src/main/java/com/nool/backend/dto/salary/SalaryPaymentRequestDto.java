package com.nool.backend.dto.salary;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SalaryPaymentRequestDto {

    @NotNull(message = "Employee id is required")
    private Long employeeId;

    @NotNull(message = "Salary start date is required")
    private LocalDate fromDate;

    @NotNull(message = "Salary end date is required")
    private LocalDate toDate;

    @NotNull(message = "Paid amount is required")
    @Positive(message = "Paid amount must be greater than zero")
    private Double amountPaid;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Payment mode is required")
    private String paymentMode;

    private String remarks;
}
