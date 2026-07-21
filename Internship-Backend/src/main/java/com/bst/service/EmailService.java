package com.bst.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
	@Autowired
	private JavaMailSender mailSender;
	
	public String sendEmail(String mailTo,String subject,String body) {
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setTo(mailTo);
			message.setFrom("bablustudieszone@gmail.com");
			message.setSubject(subject);
			message.setText(body);
			
			mailSender.send(message);
			
			return "Email Send Successfully";
		}catch(Exception e) {
			return "Error while sending Email:" + e.getMessage();
		}
	}
}
