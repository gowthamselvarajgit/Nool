package com.nool.backend.dto.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LedgerEntryRequestDto {

    @NotNull(message = "Owner id is required")
    private Long ownerId;

    @NotNull(message = "Date is required")
    private LocalDate entryDate;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;

    private String remarks;
}
