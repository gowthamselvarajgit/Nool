package com.nool.backend.auth.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.context.SecurityContextHolder;

public class CurrentUserUtil {
    private static Claims getClaims(){
        Object principal = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        if (principal instanceof Claims claims) {
            return claims;
        }
        throw new RuntimeException("Invalid security context");
    }

    public static Long getUserId(){
        return getClaims().get("userId", Long.class);
    }

    public static String getRole(){
        return getClaims().get("role", String.class);
    }

    public static Long getEmployeeId() {
        return getClaims().get("employeeId", Long.class);
    }

    public static Long getOwnerId() {
        return getClaims().get("ownerId", Long.class);
    }

}
