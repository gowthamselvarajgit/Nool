package com.nool.backend.auth.service;

import com.nool.backend.auth.dto.AuthLoginRequestDto;
import com.nool.backend.auth.dto.AuthLoginResponseDto;

public interface AuthService {
    AuthLoginResponseDto login(AuthLoginRequestDto requestDto);
}
