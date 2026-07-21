package com.bst.security;

import jakarta.servlet.http.*;
import jakarta.servlet.ServletException;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

	private final JwtUtil jwtUtil;

	public OAuthSuccessHandler(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {

		OAuth2User user = (OAuth2User) authentication.getPrincipal();

		String email = user.getAttribute("email");

		String token = jwtUtil.generateToken(email, "ROLE_STUDENT");

		response.sendRedirect("http://localhost:5173/oauth-success?token=" + token);

	}
}