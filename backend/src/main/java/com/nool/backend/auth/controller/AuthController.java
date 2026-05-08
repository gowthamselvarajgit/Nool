package com.nool.backend.auth.controller;

import com.nool.backend.auth.dto.AuthLoginResponseDto;
import com.nool.backend.auth.dto.AuthLoginRequestDto;
import com.nool.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthLoginResponseDto login(
            @Valid @RequestBody AuthLoginRequestDto requestDto) {

        return authService.login(requestDto);
    }

    @PostMapping("/logout")
    public void logout() {
        // JWT logout handled on client side
    }

    @GetMapping("/validate")
    public void validateToken() {
        // JWT already validated by filter
    }
}