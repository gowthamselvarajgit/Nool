package com.nool.backend.auth.controller;

import com.nool.backend.auth.dto.AuthLoginRequestDto;
import com.nool.backend.auth.dto.AuthLoginResponseDto;
import com.nool.backend.auth.dto.ChangePasswordRequestDto;
import com.nool.backend.auth.entity.User;
import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.auth.service.AdminUserService;
import com.nool.backend.auth.service.AuthService;
import com.nool.backend.exception.BadRequestException;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.auth.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AdminUserService adminUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public AuthLoginResponseDto login(@Valid @RequestBody AuthLoginRequestDto requestDto) {
        return authService.login(requestDto);
    }

    @PostMapping("/logout")
    public void logout() {
        // JWT logout handled on client side (token is discarded by frontend)
    }

    @GetMapping("/validate")
    public void validateToken() {
        // JWT already validated by JwtAuthenticationFilter
    }

    /**
     * Lets any authenticated user (super-admin, admin, worker, or saree-owner)
     * change their OWN password. Requires the current password as a check.
     */
    @PostMapping("/change-password")
    public Map<String, Object> changePassword(@Valid @RequestBody ChangePasswordRequestDto request) {
        Long userId = CurrentUserUtil.getUserId();
        if (userId == null) {
            throw new BadRequestException("Not authenticated");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password must be different from the current password");
        }

        adminUserService.resetPassword(userId, request.getNewPassword());
        return Map.of(
                "message", "Password updated. Please log in again with your new password.",
                "logout", true
        );
    }
}
