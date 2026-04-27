package com.nool.backend.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class OwnerPaymentRequestDto {

    @NotNull(message = "Owner id is required")
    private Long ownerId;

    @NotNull(message = "Paid amount is required")
    @Positive(message = "Paid amount must be greater than zero")
    private Double amountPaid;

    @NotNull(message = "Payment mode is required")
    private String paymentMode;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    private String remarks;
}
