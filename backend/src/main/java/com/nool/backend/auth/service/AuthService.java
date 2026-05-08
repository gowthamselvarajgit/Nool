package com.nool.backend.auth.service;

import com.nool.backend.auth.dto.LoginRequestDto;
import com.nool.backend.auth.dto.LoginResponseDto;

public interface AuthService {
    LoginResponseDto login(LoginRequestDto requestDto);
}
