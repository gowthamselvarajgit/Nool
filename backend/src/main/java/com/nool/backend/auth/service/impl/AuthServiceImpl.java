package com.nool.backend.auth.service.impl;

import com.nool.backend.auth.dto.LoginRequestDto;
import com.nool.backend.auth.dto.LoginResponseDto;
import com.nool.backend.auth.entity.User;
import com.nool.backend.auth.entity.UserProfile;
import com.nool.backend.auth.repository.UserRepository;
import com.nool.backend.auth.service.AuthService;
import com.nool.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    @Override
    public LoginResponseDto login(LoginRequestDto requestDto) {
        User user = userRepository.findByMobileNumber(requestDto.getMobileNumber()).orElseThrow(() -> new ResourceNotFoundException("Invalid mobile number or password"));

        if(!user.isActive()){
            throw new RuntimeException("User account is inactive");
        }

        if (!user.getPassword().equals(requestDto.getPassword())){
            throw new RuntimeException("Invalid mobile number or password");
        }

        UserProfile profile = user.getUserProfile();

        return LoginResponseDto.builder()
                .token("DUMMY_TOKEN")
                .role(user.getRole())
                .employeeId(profile != null ? profile.getEmployeeId() : null)
                .ownerId(profile != null ? profile.getOwnerId() : null)
                .build();
    }
}
