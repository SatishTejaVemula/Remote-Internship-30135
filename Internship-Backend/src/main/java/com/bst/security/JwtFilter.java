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

    /*
     * =========================================================
     * PUBLIC ROUTES
     *
     * These routes do NOT require JWT authentication.
     *
     * IMPORTANT:
     * /api/evaluations/ MUST NOT be here.
     * Evaluations require ADMIN or DEV authentication.
     * =========================================================
     */
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

    /*
     * =========================================================
     * DECIDE WHETHER JWT FILTER SHOULD RUN
     * =========================================================
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getRequestURI();

        return PUBLIC_ROUTES.stream()
                .anyMatch(path::startsWith);
    }

    /*
     * =========================================================
     * JWT FILTER
     * =========================================================
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        /*
         * No token.
         *
         * Don't immediately return 401 here.
         * Let Spring Security decide whether the endpoint
         * requires authentication.
         */
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        try {

            String token = authHeader.substring(7);

            String username =
                    jwtUtil.extractUsername(token);

            /*
             * Only authenticate if there isn't already
             * an authentication object.
             */
            if (username != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(username);

                /*
                 * Validate JWT.
                 */
                if (jwtUtil.validateToken(token)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    /*
                     * Put authenticated user into
                     * Spring Security context.
                     */
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);
                }
            }

        } catch (Exception e) {

            /*
             * Invalid/expired JWT.
             */
            SecurityContextHolder.clearContext();

            System.out.println(
                    "JWT authentication failed: "
                            + e.getMessage()
            );
        }

        /*
         * Continue request.
         */
        filterChain.doFilter(request, response);
    }
}
