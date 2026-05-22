package com.nool.backend.config;

import org.springframework.context.annotation.Configuration;

/**
 * ⚠️ CORS configuration has been moved to SecurityConfig.java
 * 
 * Do NOT define CorsFilter bean here as it conflicts with Spring Security's CORS configuration.
 * Having duplicate CORS configurations causes preflight requests to fail.
 * 
 * The authoritative CORS configuration is now in:
 * @see com.nool.backend.auth.security.SecurityConfig#corsConfigurationSource()
 */
@Configuration
public class CorsGlobalConfig {
    // DEPRECATED: All CORS configuration is now in SecurityConfig
}