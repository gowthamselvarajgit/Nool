package com.nool.backend.dto.employee;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateEmployeeRequestDto {
    @NotBlank(message = "Employee name is required")
    private String employeeName;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    @NotNull(message = "Polishing rate is required")
    @Positive(message = "Polishing rate must be greater than zero")
    private Double polishingRate;

    @NotBlank(message = "Mobile number is required")
    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Mobile number must be a valid 10-digit Indian mobile number"
    )
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    private String password;


}
