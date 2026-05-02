package com.nool.backend.service.impl.employee;

import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.employee.*;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.enums.EmployeeStatus;
import com.nool.backend.repository.auth.UserRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.service.employee.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Override
    public EmployeeResponseDto createEmployee(CreateEmployeeRequestDto requestDto) {
        if (employeeRepository.existsByMobileNumber(requestDto.getMobileNumber())){
            throw new RuntimeException("Employee with this mobile number already exists");
        }

        Employee employee = Employee.builder()
                .name(requestDto.getEmployeeName())
                .mobileNumber(requestDto.getMobileNumber())
                .joiningDate(requestDto.getJoiningDate())
                .polishRate(requestDto.getPolishingRate())
                .status(EmployeeStatus.ACTIVE).build();

        Employee saved = employeeRepository.save(employee);

        return EmployeeResponseDto.builder()
                .employeeId(saved.getId())
                .employeeName(saved.getName())
                .mobileNumber(saved.getMobileNumber())
                .joiningDate(saved.getJoiningDate())
                .polishingRate(saved.getPolishRate())
                .status(saved.getStatus().name())
                .build();

    }

    @Override
    public void updateEmployee(UpdateEmployeeRequestDto requestDto) {
        Employee employee = employeeRepository.findById(requestDto.getEmployeeId()).orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setName(requestDto.getEmployeeName());
        employee.setPolishRate(requestDto.getPolishingRate());
        employeeRepository.save(employee);
    }

    @Override
    public void updateEmployeeStatus(EmployeeStatusUpdateDto requestDto) {
        Employee employee = employeeRepository.findById(requestDto.getEmployeeId()).orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setStatus(EmployeeStatus.valueOf(requestDto.getStatus()));
        employeeRepository.save(employee);
    }

    @Override
    public EmployeeResponseDto getEmployeeById(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(()->new RuntimeException("Employee not found"));
        return EmployeeResponseDto.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .joiningDate(employee.getJoiningDate())
                .polishingRate(employee.getPolishRate())
                .status(employee.getStatus().name())
                .build();
    }

    @Override
    public PaginationResponseDto<EmployeeListResponse> getEmployeeList(PaginationRequestDto paginationRequestDto) {

        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                paginationRequestDto.getSortBy()
                );

        Page<Employee> page = employeeRepository.findAll(pageRequest);

        return PaginationResponseDto.<EmployeeListResponse>builder()
                .content(
                        page.getContent().stream().map(employee ->
                                EmployeeListResponse.builder()
                                        .employeeId(employee.getId())
                                        .employeeName(employee.getName())
                                        .joiningDate(employee.getJoiningDate())
                                        .polishingRate(employee.getPolishRate())
                                        .status(employee.getStatus().name()).build()
                                ).collect(Collectors.toList())
                )
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
