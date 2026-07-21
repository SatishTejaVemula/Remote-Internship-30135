package com.bst.controller;

import com.bst.model.Employer;
import com.bst.model.Internship;
import com.bst.repo.EmployerRepo;
import com.bst.service.InternshipService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internships")
public class InternshipController {

    @Autowired
    private InternshipService internshipService;

    @Autowired
    private EmployerRepo employerRepository;

    @PostMapping
    public Internship createInternship(
            @RequestBody Internship internship,
            @RequestParam Long employerId) {

        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        internship.setEmployer(employer);

        return internshipService.createInternship(internship,employerId);
    }

    @GetMapping("/all")
    public List<Internship> getAllInternships() {
        return internshipService.getAllInternships();
    }

    @GetMapping("/{id}")
    public Internship getInternshipById(@PathVariable Long id) {
        return internshipService.getInternshipById(id);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteInternship(@PathVariable Long id) {
        try {
            internshipService.deleteInternship(id);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/employer/{employerId}")
    public List<Internship> getByEmployer(@PathVariable Long employerId) {
        return internshipService.getByEmployerId(employerId);
    }
}