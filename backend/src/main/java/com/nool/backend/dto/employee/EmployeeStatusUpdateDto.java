package com.nool.backend.dto.employee;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmployeeStatusUpdateDto {
    @NotNull(message = "Employee id is required")
    private Long employeeId;

    @NotBlank(message = "Employee status is required")
    private String status;

}
