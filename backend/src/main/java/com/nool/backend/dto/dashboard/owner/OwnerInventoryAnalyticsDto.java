package com.nool.backend.dto.dashboard.owner;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class OwnerInventoryAnalyticsDto {
    private LocalDate date;
    private Long sareesGiven;
    private Long sareesReturned;
    private Long sareesInHand;
}
