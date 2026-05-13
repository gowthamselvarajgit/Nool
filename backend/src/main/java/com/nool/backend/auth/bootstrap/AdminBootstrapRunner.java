package com.nool.backend.auth.bootstrap;

import com.nool.backend.auth.entity.User;
import com.nool.backend.repository.auth.UserRepository;
import com.nool.backend.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements CommandLineRunner{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.mobile}")
    private String adminMobile;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args){
        boolean adminExists = userRepository.existsByRole(Role.ADMIN);
        if (adminExists){
            return;
        }

        User admin = new User();
        admin.setMobileNumber(adminMobile);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);

        userRepository.save(admin);

        System.out.println("✅ DEFAULT ADMIN ACCOUNT CREATED SUCCESSFULLY");

    }
}
