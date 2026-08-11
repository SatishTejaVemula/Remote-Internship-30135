package com.bst.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.bst.security.JwtFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    // =========================================
    // SECURITY FILTER CHAIN
    // =========================================

    @Bean
    SecurityFilterChain filterChain(
            HttpSecurity http) throws Exception {

        return http

                // =========================================
                // CSRF
                // =========================================

                .csrf(csrf -> csrf.disable())

                // =========================================
                // CORS
                // =========================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // =========================================
                // AUTHORIZATION
                // =========================================

                .authorizeHttpRequests(auth -> auth

                        // =====================================
                        // PUBLIC ROUTES
                        // =====================================

                        .requestMatchers(
                                "/api/auth/**",
                                "/emailotp/**",
                                "/api/applications/**",
                                "/api/tasks/**",
                                "/api/employers/**",
                                "/api/students/image/**",
                                "/api/employers/image/**",
                                "/uploads/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        )
                        .permitAll()

                        // =====================================
                        // STUDENT EVALUATIONS
                        //
                        // Students can see their feedback.
                        // =====================================

                        .requestMatchers(
                                "/api/evaluations/student/**"
                        )
                        .hasRole("STUDENT")

                        // =====================================
                        // EMPLOYER EVALUATIONS
                        //
                        // Employers are ROLE_ADMIN.
                        // =====================================

                        .requestMatchers(
                                "/api/evaluations/employer/**",
                                "/api/evaluations/all",
                                "/api/evaluations/task/**",
                                "/api/evaluations/evaluate"
                        )
                        .hasRole("ADMIN")

                        // =====================================
                        // GENERAL EVALUATION ROUTES
                        //
                        // DELETE /api/evaluations/{id}
                        // etc.
                        // =====================================

                        .requestMatchers(
                                "/api/evaluations/**"
                        )
                        .hasRole("ADMIN")

                        // =====================================
                        // DEV ROUTES
                        // =====================================

                        .requestMatchers(
                                "/api/dev/**"
                        )
                        .hasRole("DEV")

                        // =====================================
                        // INTERNSHIP CREATION
                        // =====================================

                        .requestMatchers(
                                "/api/internships/create/**"
                        )
                        .hasRole("ADMIN")

                        // =====================================
                        // OTHER INTERNSHIP ROUTES
                        // =====================================

                        .requestMatchers(
                                "/api/internships/**"
                        )
                        .permitAll()

                        // =====================================
                        // STUDENT ROUTES
                        // =====================================

                        .requestMatchers(
                                "/api/students/**"
                        )
                        .permitAll()

                        // =====================================
                        // EVERYTHING ELSE
                        // =====================================

                        .anyRequest()
                        .authenticated()
                )

                // =========================================
                // JWT FILTER
                // =========================================

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }

    // =========================================
    // PASSWORD ENCODER
    // =========================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // =========================================
    // CORS
    // =========================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config =
                new CorsConfiguration();

        config.setAllowedOrigins(
                List.of(
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "https://remote-internship-30135.vercel.app"
                )
        );

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of("*")
        );

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return source;
    }
}