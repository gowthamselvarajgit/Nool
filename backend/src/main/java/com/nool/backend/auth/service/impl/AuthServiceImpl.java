package com.nool.backend.auth.service.impl;

import com.nool.backend.auth.dto.AuthLoginRequestDto;
import com.nool.backend.auth.dto.AuthLoginResponseDto;
import com.nool.backend.auth.entity.User;
import com.nool.backend.auth.entity.UserProfile;
import com.nool.backend.auth.repository.AuthUserRepository;
import com.nool.backend.auth.security.JwtUtil;
import com.nool.backend.auth.service.AuthService;
import com.nool.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthLoginResponseDto login(AuthLoginRequestDto requestDto) {

        User user = authUserRepository
                .findByMobileNumber(requestDto.getMobileNumber())
                .orElseThrow(() -> new BadRequestException("Invalid mobile number or password"));

        if (!user.isActive()) {
            throw new BadRequestException("User account is inactive");
        }

        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid mobile number or password");
        }

        // ✅ Prepare JWT claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());

        // ✅ Generate JWT
        String token = jwtUtil.generateToken(claims, user.getMobileNumber());

        UserProfile profile = user.getUserProfile();

        return AuthLoginResponseDto.builder()
                .token(token)
                .role(user.getRole())
                .employeeId(profile != null ? profile.getEmployeeId() : null)
                .ownerId(profile != null ? profile.getOwnerId() : null)
                .build();
    }
}