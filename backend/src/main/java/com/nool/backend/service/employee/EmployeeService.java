package com.nool.backend.service.employee;

import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.employee.*;

public interface EmployeeService {
    void createEmployee(CreateEmployeeRequestDto requestDto);

    void updateEmployee(UpdateEmployeeRequestDto requestDto);

    void updateEmployeeStatus(EmployeeStatusUpdateDto requestDto);

    EmployeeResponseDto getEmployeeById(Long employeeId);

    PaginationResponseDto<EmployeeListResponse> getEmployeeList(PaginationRequestDto paginationRequestDto);
}
