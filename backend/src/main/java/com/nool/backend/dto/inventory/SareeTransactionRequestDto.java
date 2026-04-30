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

    @NotNull(message = "Received date is required")
    private LocalDate receivedDate;

    @NotNull(message = "Received saree count is required")
    @PositiveOrZero(message = "Received quantity cannot be negative")
    private Integer receivedQuantity;

    @NotNull(message = "Returned date is required")
    private LocalDate returnedDate;

    @NotNull(message = "Returned saree count is required")
    @PositiveOrZero(message = "Returned saree count cannot be negative")
    private Integer returnedQuantity;

    private String remarks;
}
