package com.nool.backend.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponseDto {
    private Long userId;
    private String fullName;
    private String mobileNumber;
    private String role;
    private boolean active;
}
