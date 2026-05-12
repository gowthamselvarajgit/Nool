package com.nool.backend.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:4173"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .authorizeHttpRequests(auth -> auth
                        // ── Public ────────────────────────────────────────────────────────
                        .requestMatchers("/auth/**").permitAll()

                        // ── Employee management ───────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/employees").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/employees").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/employees/status").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/employees/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/employees/list").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/employees/me").hasAnyAuthority("ADMIN", "WORKER")
                        .requestMatchers(HttpMethod.GET,    "/employees/**").hasAnyAuthority("ADMIN", "WORKER")

                        // ── Attendance ────────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/attendance").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/attendance/list").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/attendance/employee/*/summary").hasAnyAuthority("ADMIN", "WORKER")
                        .requestMatchers(HttpMethod.POST,   "/attendance/summary").hasAnyAuthority("ADMIN", "WORKER")
                        .requestMatchers(HttpMethod.GET,    "/attendance/**").hasAnyAuthority("ADMIN", "WORKER")

                        // ── Daily Work ────────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/employee-daily-working").hasAnyAuthority("ADMIN", "WORKER")
                        .requestMatchers(HttpMethod.POST,   "/employee-daily-working/list").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/employee-daily-working/employee/*/summary").hasAnyAuthority("ADMIN", "WORKER")
                        .requestMatchers(HttpMethod.POST,   "/employee-daily-working/summary").hasAnyAuthority("ADMIN", "WORKER")

                        // ── Salary ────────────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/salary-payments").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/salary-payments/employee/*/history").hasAnyAuthority("ADMIN", "WORKER")
                        .requestMatchers(HttpMethod.POST,   "/salary-payments/summary").hasAnyAuthority("ADMIN", "WORKER")
                        .requestMatchers(HttpMethod.POST,   "/salary-payments/**").hasAuthority("ADMIN")

                        // ── Owners ────────────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/owners").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/owners").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/owners/list").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/owners/me").hasAnyAuthority("ADMIN", "SAREE_OWNER")
                        .requestMatchers(HttpMethod.GET,    "/owners/**").hasAnyAuthority("ADMIN", "SAREE_OWNER")

                        // ── Inventory ─────────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/inventory/transaction").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/inventory/transaction/*/returns").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/inventory/transaction/*/return").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/inventory/owner/*/transactions").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/inventory/owner/*/summary").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/inventory/summary").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/inventory/transactions").hasAnyAuthority("ADMIN", "SAREE_OWNER")
                        .requestMatchers(HttpMethod.POST,   "/inventory/my-summary").hasAnyAuthority("ADMIN", "SAREE_OWNER")

                        // ── Owner Payments ────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/owner-payments").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/owner-payments/owner/*/history").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/owner-payments/owner/*/summary").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/owner-payments/history").hasAnyAuthority("ADMIN", "SAREE_OWNER")
                        .requestMatchers(HttpMethod.POST,   "/owner-payments/summary").hasAnyAuthority("ADMIN", "SAREE_OWNER")

                        // ── Fallback ──────────────────────────────────────────────────────
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}