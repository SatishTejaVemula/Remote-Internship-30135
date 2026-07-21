package com.bst.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bst.model.Student;
import com.bst.repo.StudentRepo;

@RestController
@RequestMapping("/auth")
public class SecurityController {
	@Autowired
	private StudentRepo studentRepo;
	
	
	@PostMapping
	public String addStudent(@RequestBody Student student) {
		studentRepo.save(student);
		return "User Saved";
	}
	
}
