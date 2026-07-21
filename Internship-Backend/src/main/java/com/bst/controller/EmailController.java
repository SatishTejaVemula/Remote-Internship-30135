package com.bst.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bst.service.EmailService;

@RestController
@RequestMapping("/email")
public class EmailController {
	@Autowired
	private EmailService emailService;
	
	@PostMapping("/sendEmail")
	public ResponseEntity<String> sendEmail(@RequestParam("to") String mailTo,
			                                @RequestParam("subject") String subject,
			                                @RequestParam("body") String body){
		return ResponseEntity.ok(emailService.sendEmail(mailTo, subject, body));
	}
}
