package com.nool.backend.dto.dailywork;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeDailyWorkRequestDto {

    @NotNull(message = "Employee id is required")
    private Long employeeId;

    @NotNull(message = "Word date is required")
    private LocalDate workDate;

    @NotNull(message = "Fresh saree count is required")
    @PositiveOrZero(message = "Fresh saree count cannot be negative")
    private Integer freshCount;

    @NotNull(message = "Re-polish saree count is required")
    @PositiveOrZero(message = "Re-polish saree count cannot be negative")
    private Integer rePolishCount;
}
