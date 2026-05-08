package com.nool.backend.auth.service.impl;

import com.nool.backend.auth.entity.User;
import com.nool.backend.auth.entity.UserProfile;
import com.nool.backend.auth.repository.AuthUserRepository;
import com.nool.backend.auth.service.AdminUserService;
import com.nool.backend.enums.Role;
import com.nool.backend.repository.auth.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {
    private final AuthUserRepository authUserRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void createEmployeeUser(String mobileNumber, String rawPassword, Long employeeId) {
        User user = User.builder()
                .mobileNumber(mobileNumber)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.WORKER)
                .active(true)
                .build();
        authUserRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(user)
                .employeeId(employeeId)
                .build();
        userProfileRepository.save(profile);
    }

    @Override
    public void createOwnerUser(String mobileNumber, String rawPassword, Long ownerId) {
        User user = User.builder()
                .mobileNumber(mobileNumber)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.SAREE_OWNER)
                .active(true)
                .build();
        authUserRepository.save(user);

        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .ownerId(ownerId)
                .build();
        userProfileRepository.save(userProfile);
    }
}
