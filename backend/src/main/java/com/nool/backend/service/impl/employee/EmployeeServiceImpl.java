package com.nool.backend.service.impl.employee;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.auth.entity.User;
import com.nool.backend.auth.entity.UserProfile;
import com.nool.backend.auth.service.AdminUserService;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.employee.*;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.enums.EmployeeStatus;
import com.nool.backend.exception.DuplicateResourceException;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.auth.UserRepository;
import com.nool.backend.repository.auth.UserProfileRepository;
import com.nool.backend.repository.employee.AttendanceRepository;
import com.nool.backend.repository.employee.EmployeeDailyWorkRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.repository.employee.SalaryPaymentRepository;
import com.nool.backend.service.employee.EmployeeService;
import jakarta.transaction.Transactional;
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
    private final UserProfileRepository userProfileRepository;
    private final AdminUserService adminUserService;
    private final AttendanceRepository attendanceRepository;
    private final SalaryPaymentRepository salaryPaymentRepository;
    private final EmployeeDailyWorkRepository dailyWorkRepository;

    @Override
    @Transactional
    public EmployeeResponseDto createEmployee(CreateEmployeeRequestDto requestDto) {
        String mobile = requestDto.getMobileNumber();

        if (employeeRepository.existsByMobileNumber(mobile)) {
            throw new DuplicateResourceException("Employee with this mobile number already exists");
        }

        // If a login User exists for this mobile, decide whether it's a legitimate
        // conflict (admin, owner, or another linked employee) or a stale orphan
        // from a previously-failed create — orphans get cleaned up so the retry can
        // succeed.
        userRepository.findByMobileNumber(mobile).ifPresent(existingUser -> {
            UserProfile profile = userProfileRepository.findByUserId(existingUser.getId()).orElse(null);
            boolean linkedToSomething = profile != null
                    && (profile.getEmployeeId() != null || profile.getOwnerId() != null);
            boolean isAdmin = existingUser.getRole() != null
                    && existingUser.getRole().name().equals("ADMIN");
            if (linkedToSomething || isAdmin) {
                throw new DuplicateResourceException("This mobile number is already in use by another account");
            }
            // Orphan user — drop it so we can re-register cleanly.
            if (profile != null) {
                userProfileRepository.delete(profile);
            }
            userRepository.delete(existingUser);
            userRepository.flush();
        });

        Employee employee = Employee.builder()
                .name(requestDto.getEmployeeName())
                .mobileNumber(mobile)
                .joiningDate(requestDto.getJoiningDate())
                .polishRate(requestDto.getPolishingRate())
                .status(EmployeeStatus.ACTIVE).build();

        Employee saved = employeeRepository.save(employee);

        // Create associated user account with login credentials
        User user = adminUserService.createEmployeeUser(
            mobile,
            requestDto.getPassword(),
            saved.getId()
        );
        saved.setUser(user);
        saved = employeeRepository.save(saved);

        return EmployeeResponseDto.builder()
                .employeeId(saved.getId())
                .employeeName(saved.getName())
                .mobileNumber(saved.getMobileNumber())
                .joiningDate(saved.getJoiningDate())
                .polishingRate(saved.getPolishRate())
                .status(saved.getStatus().name())
                .build();

    }

    @Transactional
    @Override
    public void updateEmployee(UpdateEmployeeRequestDto requestDto) {

        Employee employee = employeeRepository.findById(requestDto.getEmployeeId()).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        if (!employee.getMobileNumber().equals(requestDto.getMobileNumber()) &&
        employeeRepository.existsByMobileNumber(requestDto.getMobileNumber())){
            throw new DuplicateResourceException("Mobile number already in use");
        }
        if (!employee.getMobileNumber().equals(requestDto.getMobileNumber()) &&
                userRepository.existsByMobileNumber(requestDto.getMobileNumber())) {
            throw new DuplicateResourceException("A login account with this mobile number already exists");
        }
        employee.setName(requestDto.getEmployeeName());
        employee.setPolishRate(requestDto.getPolishingRate());
        employee.setMobileNumber(requestDto.getMobileNumber());
        User user = employee.getUser();
        if (user == null) {
            user = userProfileRepository.findByEmployeeId(employee.getId())
                    .map(profile -> profile.getUser())
                    .orElse(null);
        }
        if (user != null) {
            user.setMobileNumber(requestDto.getMobileNumber());
            userRepository.save(user);
            employee.setUser(user);
        }
        employeeRepository.save(employee);
    }

    @Transactional
    @Override
    public void updateEmployeeStatus(EmployeeStatusUpdateDto requestDto) {
        Employee employee = employeeRepository.findById(requestDto.getEmployeeId()).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        employee.setStatus(requestDto.getStatus());
        employeeRepository.save(employee);
    }

    @Override
    public EmployeeResponseDto getEmployeeById(Long employeeId) {
        // A WORKER can only read their own profile, never another employee's.
        String role = CurrentUserUtil.getRole();
        if (!"ADMIN".equals(role)) {
            Long callerEmployeeId = CurrentUserUtil.getEmployeeId();
            if (callerEmployeeId == null || !callerEmployeeId.equals(employeeId)) {
                throw new org.springframework.security.access.AccessDeniedException("You can only view your own profile");
            }
        }
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(()->new ResourceNotFoundException("Employee not found"));
        return EmployeeResponseDto.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .joiningDate(employee.getJoiningDate())
                .polishingRate(employee.getPolishRate())
                .mobileNumber(employee.getMobileNumber())
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

        String keyword = paginationRequestDto.getSearchKeyword();
        Page<Employee> page = (keyword != null && !keyword.isBlank())
                ? employeeRepository.searchEmployees(keyword, pageRequest)
                : employeeRepository.findAll(pageRequest);

        return PaginationResponseDto.<EmployeeListResponse>builder()
                .content(
                        page.getContent().stream().map(employee ->
                                EmployeeListResponse.builder()
                                        .employeeId(employee.getId())
                                        .employeeName(employee.getName())
                                        .mobileNumber(employee.getMobileNumber())
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

    @Override
    public EmployeeResponseDto getMyProfile() {
        Long employeeId = CurrentUserUtil.getEmployeeId();
        if (employeeId == null){
            throw new RuntimeException("Access denied");
        }
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return EmployeeResponseDto.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .joiningDate(employee.getJoiningDate())
                .polishingRate(employee.getPolishRate())
                .mobileNumber(employee.getMobileNumber())
                .status(employee.getStatus().name())
                .build();
    }

    @Override
    @Transactional
    public void deleteEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        // 1. Cascade-delete all child records that reference employee_id via FK.
        //    MySQL won't let us drop the parent row otherwise.
        dailyWorkRepository.deleteAllByEmployeeId(employeeId);
        salaryPaymentRepository.deleteAllByEmployeeId(employeeId);
        attendanceRepository.deleteAllByEmployeeId(employeeId);

        // 2. Unlink the user from the employee, then delete the profile + user.
        UserProfile profile = userProfileRepository.findByEmployeeId(employeeId).orElse(null);
        User user = employee.getUser();
        if (user == null && profile != null) {
            user = profile.getUser();
        }
        if (user != null) {
            employee.setUser(null);
            employeeRepository.save(employee);
            employeeRepository.flush();
        }
        if (profile != null) {
            userProfileRepository.delete(profile);
            userProfileRepository.flush();
        }
        if (user != null) {
            userRepository.delete(user);
        }

        // 3. Finally drop the employee row.
        employeeRepository.delete(employee);
    }
}
