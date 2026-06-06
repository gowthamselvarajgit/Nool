package com.nool.backend.dto.payment;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class OwnerPaymentResponseDto {
    private Long paymentId;
    private Long ownerId;
    private String ownerName;
    private Double amountPaid;
    private Double advanceAmount;   // signed advance change for this row (null = legacy 0)
    private String paymentMode;
    private LocalDate paymentDate;
    private String remarks;
}
