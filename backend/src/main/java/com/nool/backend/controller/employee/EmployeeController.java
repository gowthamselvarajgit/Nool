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

    //✅ EMPLOYEE CREATE API – PASSED
    @PostMapping
    public EmployeeResponseDto createEmployee(@Valid @RequestBody CreateEmployeeRequestDto requestDto){
        return employeeService.createEmployee(requestDto);
    }

    //✅ EMPLOYEE UPDATE API – PASSED
    @PutMapping
    public void updateEmployee(@Valid @RequestBody UpdateEmployeeRequestDto requestDto){
        employeeService.updateEmployee(requestDto);
    }

    //✅ EMPLOYEE STATUS UPDATE API – PASSED
    @PatchMapping("/status")
    public void updateEmployeeStatus(@Valid @RequestBody EmployeeStatusUpdateDto requestDto){
        employeeService.updateEmployeeStatus(requestDto);
    }

    //✅ EMPLOYEE GET API – PASSED
    @GetMapping("/{employeeId}")
    public EmployeeResponseDto getEmployeeById(@PathVariable Long employeeId){
        return employeeService.getEmployeeById(employeeId);
    }

    //✅ EMPLOYEE LIST API – PASSED
    @PostMapping("/list")
    public PaginationResponseDto<EmployeeListResponse> getEmployeeList(@RequestBody PaginationRequestDto paginationRequestDto){
        return employeeService.getEmployeeList(paginationRequestDto);
    }

    @GetMapping("/me")
    public EmployeeResponseDto getMyProfile(){
        return employeeService.getMyProfile();
    }

    //✅ EMPLOYEE DELETE API
    @DeleteMapping("/{employeeId}")
    public void deleteEmployee(@PathVariable Long employeeId){
        employeeService.deleteEmployee(employeeId);
    }
}
