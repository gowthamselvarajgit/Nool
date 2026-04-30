package com.nool.backend.dto.inventory;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SareeInventorySummaryDto {
    private Long totalSareesReceived;
    private Long totalSareesReturned;
    private Long sareesInHand;

}
