package com.bst.controller;

import com.bst.model.Student;
import com.bst.model.Employer;
import com.bst.model.Developer;
import com.bst.repo.StudentRepo;
import com.bst.repo.EmployerRepo;
import com.bst.repo.DeveloperRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dev")//http://localhost:1305/api/dev/all-users?email=babludev@gmail.com&password=dev123
public class DevController {

    @Autowired
    private DeveloperRepo developerRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private EmployerRepo employerRepo;

    @GetMapping("/all-users")
    public List<Student> getAllUsers(
            @RequestParam String email,
            @RequestParam String password
    ) {

        Developer dev = developerRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Developer not found"));

        if (!dev.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }

        return studentRepo.findAll();
    }

    @GetMapping("/all-employers")
    public List<Employer> getAllEmployers(
            @RequestParam String email,
            @RequestParam String password
    ) {

        Developer dev = developerRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Developer not found"));

        if (!dev.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }

        return employerRepo.findAll();
    }
}