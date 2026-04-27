package com.nool.backend.dto.dashboard.owner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OwnerDashboardSummaryDto {
    private Long ownerId;
    private String ownerName;

    private Long totalSareesGiven;
    private Long totalSareesReturned;
    private Long sareesInHand;

    private Double totalAmountPayable;
    private Double totalAmountPaid;
    private Double pendingAmount;
}
