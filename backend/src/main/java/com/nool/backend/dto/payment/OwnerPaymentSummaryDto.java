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

    /**
     * Net advance balance: SUM(COALESCE(advance_amount, 0)) across all this
     * owner's payment rows.
     *   Positive  → workshop currently holds an advance from this owner
     *               (will be deducted from a future polish bill)
     *   Negative  → workshop owes this owner an advance refund
     *   0 / null  → no advance outstanding (default for legacy data)
     */
    private Double advanceBalance;
}
