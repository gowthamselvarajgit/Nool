package com.nool.backend.auth.dto;

import com.nool.backend.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AuthLoginResponseDto {
    private String token;
    private Role role;
    private Long employeeId;
    private Long ownerId;
}
