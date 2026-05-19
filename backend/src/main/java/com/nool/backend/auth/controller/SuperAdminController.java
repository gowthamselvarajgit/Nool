package com.nool.backend.auth.controller;

import com.nool.backend.auth.dto.AdminCreateRequestDto;
import com.nool.backend.auth.dto.AdminResponseDto;
import com.nool.backend.auth.entity.User;
import com.nool.backend.auth.service.AdminUserService;
import com.nool.backend.enums.Role;
import com.nool.backend.exception.BadRequestException;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.auth.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

/**
 * Endpoints exclusively available to SUPER_ADMIN users.
 *
 * Locked down in SecurityConfig: any path under /super-admin requires the
 * SUPER_ADMIN authority. Regular ADMINs cannot reach these endpoints.
 */
@RestController
@RequestMapping("/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final AdminUserService adminUserService;
    private final UserRepository userRepository;

    /** Create a new ADMIN account. */
    @PostMapping("/admins")
    public ResponseEntity<AdminResponseDto> createAdmin(@Valid @RequestBody AdminCreateRequestDto request) {
        User created = adminUserService.createAdminUser(
                request.getMobileNumber(),
                request.getPassword(),
                request.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(created));
    }

    /** List every ADMIN account. Sorted newest-first. */
    @GetMapping("/admins")
    public List<AdminResponseDto> listAdmins() {
        return userRepository.findByRole(Role.ADMIN).stream()
                .sorted(Comparator.comparing(User::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDto)
                .toList();
    }

    /** Toggle an admin's active flag — disabled admins cannot log in. */
    @PatchMapping("/admins/{id}/status")
    public AdminResponseDto setAdminStatus(@PathVariable Long id, @RequestParam boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Target user is not an ADMIN");
        }
        user.setActive(active);
        return toDto(userRepository.save(user));
    }

    /** Reset an admin's password. */
    @PatchMapping("/admins/{id}/password")
    public AdminResponseDto resetAdminPassword(@PathVariable Long id,
                                               @Valid @RequestBody PasswordResetRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Target user is not an ADMIN");
        }
        User updated = adminUserService.resetPassword(id, request.getPassword());
        return toDto(updated);
    }

    @Data
    public static class PasswordResetRequest {
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;
    }

    private AdminResponseDto toDto(User u) {
        return AdminResponseDto.builder()
                .userId(u.getId())
                .name(u.getName())
                .mobileNumber(u.getMobileNumber())
                .role(u.getRole().name())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
