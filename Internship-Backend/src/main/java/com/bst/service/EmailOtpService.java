package com.bst.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailOtpService {
	@Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("bablustudieszone@gmail.com");
        message.setTo(toEmail);
        message.setSubject("OTP Verification");

        message.setText("Your OTP is: " + otp + 
                "\nDo not share this OTP with anyone.");

        mailSender.send(message);
    }
}
