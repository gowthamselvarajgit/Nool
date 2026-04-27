package com.nool.backend.dto.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SareeTransactionRequestDto {
    @NotNull(message = "Owner id is required")
    private Long ownerId;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @NotNull(message = "Received saree count is required")
    @PositiveOrZero(message = "Received saree count cannot be negative")
    private Integer receivedCount;

    @NotNull(message = "Returned saree count is required")
    @PositiveOrZero(message = "Returned saree count cannot be negative")
    private Integer returnedCount;

    private String remarks;
}
