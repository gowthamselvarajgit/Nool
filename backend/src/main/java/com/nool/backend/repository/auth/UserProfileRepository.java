package com.nool.backend.repository.auth;

import com.nool.backend.auth.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId);
    Optional<UserProfile> findByEmployeeId(Long employeeId);
    Optional<UserProfile> findByOwnerId(Long ownerId);
}
