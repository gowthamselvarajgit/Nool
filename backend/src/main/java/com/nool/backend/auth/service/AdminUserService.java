package com.nool.backend.auth.service;

public interface AdminUserService {
    void createEmployeeUser(String mobileNumber, String rawPassword, Long employeeId);
    void createOwnerUser(String mobileNumber, String rawPassword, Long ownerId);
}

