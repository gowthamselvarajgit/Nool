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
    private String name;          // Display name (set for ADMIN / SUPER_ADMIN; may be null for others)
    private String mobileNumber;  // Echoed back so the SPA doesn't need to re-derive it
    private Long employeeId;
    private Long ownerId;
}
