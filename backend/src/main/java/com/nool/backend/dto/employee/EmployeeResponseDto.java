package com.nool.backend.dto.employee;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class EmployeeResponseDto {
    private Long employeeId;
    private String employeeName;
    private LocalDate joiningDate;
    private Double polishingRate;
    private String status;
    private String mobileNumber;
}
