package com.bst.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    // =========================================
    // PUBLIC ROUTES
    // =========================================
    //
    // IMPORTANT:
    // /api/evaluations/ is NOT here.
    //
    // Evaluation endpoints require JWT.
    //
    private static final List<String> PUBLIC_ROUTES = List.of(
            "/api/auth/",
            "/emailotp/",
            "/api/internships/",
            "/api/applications/",
            "/api/tasks/",
            "/api/employers/",
            "/uploads/",
            "/swagger-ui/",
            "/v3/api-docs/"
    );

    // =========================================
    // SHOULD NOT FILTER
    // =========================================

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request) {

        String path = request.getRequestURI();

        return PUBLIC_ROUTES.stream()
                .anyMatch(path::startsWith);
    }

    // =========================================
    // JWT FILTER
    // =========================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "===================================="
        );

        System.out.println(
                "JWT FILTER: " +
                request.getMethod() +
                " " +
                request.getRequestURI()
        );

        // =========================================
        // NO TOKEN
        // =========================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "JWT FILTER: No Bearer token"
            );

            System.out.println(
                    "===================================="
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        try {

            String token =
                    authHeader.substring(7);

            String username =
                    jwtUtil.extractUsername(token);

            System.out.println(
                    "JWT USERNAME: " + username
            );

            // =========================================
            // AUTHENTICATE USER
            // =========================================

            if (username != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(username);

                System.out.println(
                        "JWT AUTHORITIES: " +
                        userDetails.getAuthorities()
                );

                // =========================================
                // VALIDATE TOKEN
                // =========================================

                if (jwtUtil.validateToken(token)) {

                    UsernamePasswordAuthenticationToken
                            authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authenticationToken
                            );

                    System.out.println(
                            "JWT AUTHENTICATION SUCCESS"
                    );

                } else {

                    System.out.println(
                            "JWT TOKEN INVALID"
                    );
                }
            }

        } catch (Exception e) {

            SecurityContextHolder
                    .clearContext();

            System.out.println(
                    "JWT authentication failed: "
                            + e.getMessage()
            );
        }

        System.out.println(
                "===================================="
        );

        filterChain.doFilter(
                request,
                response
        );
    }
}