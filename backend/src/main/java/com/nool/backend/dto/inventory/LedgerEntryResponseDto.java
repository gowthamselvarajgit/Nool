package com.nool.backend.dto.inventory;

import com.nool.backend.enums.LedgerEntryType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class LedgerEntryResponseDto {
    private Long entryId;
    private Long ownerId;
    private String ownerName;
    private LedgerEntryType entryType;
    private LocalDate entryDate;
    private Integer quantity;
    private String remarks;
}
