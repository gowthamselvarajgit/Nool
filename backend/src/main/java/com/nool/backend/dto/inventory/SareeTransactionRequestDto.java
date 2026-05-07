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

    private LocalDate receivedDate;
    private Integer receivedQuantity;

    private LocalDate returnedDate;
    private Integer returnedQuantity;

    private String remarks;
}
