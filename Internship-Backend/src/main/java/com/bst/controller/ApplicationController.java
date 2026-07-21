package com.bst.controller;

import com.bst.dto.ApplicationDTO;
import com.bst.model.Application;
import com.bst.repo.ApplicationRepo;
import com.bst.service.ApplicationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicationRepo applicationRepo;

    @PostMapping("/apply")
    public Application apply(
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String role,
            @RequestParam String university,
            @RequestParam(required = false) Double gpa,
            @RequestParam Long userId,
            @RequestParam Long internshipId,
            @RequestParam(value = "resume", required = false) MultipartFile file
    ) throws Exception {

        return applicationService.apply(
                fullName, email, role, university,
                gpa, userId, internshipId, file
        );
    }

    @GetMapping("/check")
    public boolean hasApplied(
            @RequestParam Long studentId,
            @RequestParam Long internshipId
    ) {
        return applicationRepo
                .findByStudentIdAndInternshipId(studentId, internshipId)
                .isPresent();
    }

    @GetMapping("/all")
    public List<Application> getAll() {
        return applicationService.getAllApplications();
    }

    @PutMapping("/{id}/status")
    public Application updateStatus(@PathVariable Long id,
                                   @RequestParam String status) {
        return applicationService.updateStatus(id, status);
    }


    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return "Application deleted";
    }
    
    @GetMapping("/student/{studentId}")
    public List<ApplicationDTO> getApplicationsByStudent(
            @PathVariable Long studentId) {

        try {
            return applicationService.getApplicationsByStudent(studentId);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
    
    @GetMapping("/employer/{employerId}")
    public List<ApplicationDTO> getApplicationsByEmployer(@PathVariable Long employerId) {
        return applicationService.getApplicationsByEmployerDTO(employerId);
    }
    
    @GetMapping("/internship/{internshipId}")
    public List<ApplicationDTO> getByInternship(@PathVariable Long internshipId) {
        return applicationService.getApplicationsByInternship(internshipId);
    }
    
}