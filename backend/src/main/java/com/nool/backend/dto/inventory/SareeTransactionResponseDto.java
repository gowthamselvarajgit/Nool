package com.nool.backend.dto.inventory;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class SareeTransactionResponseDto {
    private Long transactionId;
    private Long ownerId;
    private String ownerName;
    private LocalDate receivedDate;
    private Integer receivedQuantity;

    // Aggregated from saree_returns table
    private Long totalReturned;      // sum of all partial returns
    private Integer sareesInHand;    // receivedQuantity - totalReturned
    private Boolean fullyReturned;   // sareesInHand == 0

    // Return history
    private List<SareeReturnResponseDto> returns;

    // Legacy fields kept for backward compat (last return date/qty from the old PATCH flow)
    private LocalDate returnedDate;
    private Integer returnedQuantity;

    private String remarks;
}
