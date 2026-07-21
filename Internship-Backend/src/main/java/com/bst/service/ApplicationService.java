package com.bst.service;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.bst.dto.ApplicationDTO;
import com.bst.model.Application;

public interface ApplicationService {

    Application apply(
        String fullName,
        String email,
        String role,
        String university,
        Double gpa,
        Long userId,
        Long internshipId,
        MultipartFile file
    ) throws IOException;

    List<ApplicationDTO> getApplicationsByStudent(Long studentId);

    List<Application> getApplicationsByEmployer(Long employerId);

    List<ApplicationDTO> getApplicationsByInternship(Long internshipId);

    Application updateStatus(Long id, String status);
    
    List<ApplicationDTO> getApplicationsByEmployerDTO(Long employerId);

    void deleteApplication(Long id);

	List<Application> getAllApplications();
}