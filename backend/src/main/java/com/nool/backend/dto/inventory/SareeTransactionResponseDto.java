package com.nool.backend.dto.inventory;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SareeTransactionResponseDto {
    private Long transactionId;
    private Long ownerId;
    private String ownerName;
    private LocalDate transactionDate;
    private Integer returnedCount;
    private String remarks;
}
