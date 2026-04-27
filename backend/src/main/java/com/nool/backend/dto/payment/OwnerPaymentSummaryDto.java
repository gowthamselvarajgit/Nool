package com.nool.backend.dto.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OwnerPaymentSummaryDto {
    private Long ownerId;
    private String ownerName;
    private Double totalAmountPayable;
    private Double totalAmountPaid;
    private Double pendingAmount;
}
