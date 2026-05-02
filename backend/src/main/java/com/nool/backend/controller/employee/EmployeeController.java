package com.nool.backend.controller.employee;

import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.employee.*;
import com.nool.backend.service.employee.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;

    @PostMapping
    public EmployeeResponseDto createEmployee(@Valid @RequestBody CreateEmployeeRequestDto requestDto){
        return employeeService.createEmployee(requestDto);
    }

    @PutMapping
    public void updateEmployee(@Valid @RequestBody UpdateEmployeeRequestDto requestDto){
        employeeService.updateEmployee(requestDto);
    }

    @PatchMapping("/status")
    public void updateEmployeeStatus(@Valid @RequestBody EmployeeStatusUpdateDto requestDto){
        employeeService.updateEmployeeStatus(requestDto);
    }

    @GetMapping("/{employeeId}")
    public EmployeeResponseDto getEmployeeById(@PathVariable Long employeeId){
        return employeeService.getEmployeeById(employeeId);
    }

    public PaginationResponseDto<EmployeeListResponse> getEmployeeList(@RequestBody PaginationRequestDto paginationRequestDto){
        return employeeService.getEmployeeList(paginationRequestDto);
    }
}
