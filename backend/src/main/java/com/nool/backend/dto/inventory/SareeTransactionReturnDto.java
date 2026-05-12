package com.nool.backend.dto.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SareeTransactionReturnDto {

    @NotNull(message = "Returned date is required")
    private LocalDate returnedDate;

    @NotNull(message = "Returned quantity is required")
    @Positive(message = "Returned quantity must be greater than zero")
    private Integer returnedQuantity;

    private String remarks;
}
