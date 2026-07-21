package com.bst.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bst.service.OtpService;

@RestController
@RequestMapping("/emailotp")
public class EmailOtpController {
	@Autowired
	private OtpService otpService;

	@PostMapping("/send")
	public String sendOtp(@RequestParam String email) {
		return otpService.sendOtp(email);
	}

	@PostMapping("/verify")
	public String verifyOtp(@RequestParam String email, @RequestParam String otp) {
		return otpService.verifyOtp(email, otp);
	}
}
