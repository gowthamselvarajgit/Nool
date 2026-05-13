package com.nool.backend.auth.service;

import com.nool.backend.auth.entity.User;

public interface AdminUserService {
    User createEmployeeUser(String mobileNumber, String rawPassword, Long employeeId);
    User createOwnerUser(String mobileNumber, String rawPassword, Long ownerId);
}

