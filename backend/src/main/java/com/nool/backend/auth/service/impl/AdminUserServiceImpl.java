package com.nool.backend.auth.service.impl;

import com.nool.backend.auth.entity.User;
import com.nool.backend.auth.entity.UserProfile;
import com.nool.backend.repository.auth.UserRepository;
import com.nool.backend.auth.service.AdminUserService;
import com.nool.backend.enums.Role;
import com.nool.backend.exception.DuplicateResourceException;
import com.nool.backend.repository.auth.UserProfileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User createEmployeeUser(String mobileNumber, String rawPassword, Long employeeId) {
        if (userRepository.findByMobileNumber(mobileNumber).isPresent()) {
            throw new DuplicateResourceException("A login account with this mobile number already exists");
        }

        User user = User.builder()
                .mobileNumber(mobileNumber)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.WORKER)
                .active(true)
                .build();
        User savedUser = userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .employeeId(employeeId)
                .build();
        userProfileRepository.save(profile);
        return savedUser;
    }

    @Override
    @Transactional
    public User createOwnerUser(String mobileNumber, String rawPassword, Long ownerId) {
        if (userRepository.findByMobileNumber(mobileNumber).isPresent()) {
            throw new DuplicateResourceException("A login account with this mobile number already exists");
        }

        User user = User.builder()
                .mobileNumber(mobileNumber)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.SAREE_OWNER)
                .active(true)
                .build();
        User savedUser = userRepository.save(user);

        UserProfile userProfile = UserProfile.builder()
                .user(savedUser)
                .ownerId(ownerId)
                .build();
        userProfileRepository.save(userProfile);
        return savedUser;
    }
}
