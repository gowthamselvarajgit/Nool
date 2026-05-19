package com.nool.backend.auth.bootstrap;

import com.nool.backend.auth.entity.User;
import com.nool.backend.repository.auth.UserRepository;
import com.nool.backend.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * On first startup, seeds a single SUPER_ADMIN account from environment variables.
 *
 * Production setup:
 *   - Set SUPER_ADMIN_MOBILE and SUPER_ADMIN_PASSWORD in .env (or the hosting
 *     platform's environment).
 *   - The application will create the super admin only if no SUPER_ADMIN already
 *     exists in the database. Subsequent restarts are no-ops.
 *
 * The super admin can then log in and create regular ADMIN accounts via the
 * super-admin UI (or the POST /super-admin/admins endpoint).
 *
 * NOTE: Regular ADMIN accounts are NOT auto-seeded — they must be created by a
 * super admin after the first login.
 */
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${super-admin.mobile:}")
    private String superAdminMobile;

    @Value("${super-admin.password:}")
    private String superAdminPassword;

    @Value("${super-admin.name:Super Admin}")
    private String superAdminName;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.SUPER_ADMIN)) {
            return; // Already seeded
        }

        if (superAdminMobile == null || superAdminMobile.isBlank()
                || superAdminPassword == null || superAdminPassword.isBlank()) {
            System.out.println("⚠ No SUPER_ADMIN seeded — set SUPER_ADMIN_MOBILE and "
                    + "SUPER_ADMIN_PASSWORD env vars (see .env.example) to enable seeding.");
            return;
        }

        if (userRepository.existsByMobileNumber(superAdminMobile)) {
            System.out.println("⚠ A user with mobile " + superAdminMobile
                    + " already exists — skipping SUPER_ADMIN seed.");
            return;
        }

        User superAdmin = User.builder()
                .mobileNumber(superAdminMobile)
                .password(passwordEncoder.encode(superAdminPassword))
                .role(Role.SUPER_ADMIN)
                .name(superAdminName)
                .active(true)
                .build();

        userRepository.save(superAdmin);
        System.out.println("✓ SUPER_ADMIN account '" + superAdminName + "' created for mobile " + superAdminMobile);
    }
}
