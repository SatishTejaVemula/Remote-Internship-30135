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

    @Bean
    SecurityFilterChain filterChain(
            HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )
                .authorizeHttpRequests(auth -> auth

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

                        .requestMatchers(
                                "/api/evaluations/student/**"
                        )
                        .hasRole("STUDENT")

                        .requestMatchers(
                                "/api/evaluations/employer/**",
                                "/api/evaluations/all",
                                "/api/evaluations/task/**",
                                "/api/evaluations/evaluate"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                "/api/evaluations/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                "/api/dev/**"
                        )
                        .hasRole("DEV")

                        .requestMatchers(
                                "/api/internships/create/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                "/api/internships/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                "/api/students/**"
                        )
                        .permitAll()

                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

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