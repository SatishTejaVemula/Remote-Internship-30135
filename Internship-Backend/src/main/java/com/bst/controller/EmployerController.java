package com.bst.controller;

import com.bst.dto.EmployerDTO;
import com.bst.model.Employer;
import com.bst.model.Student;
import com.bst.repo.EmployerRepo;
import com.bst.service.EmployerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/employers")
public class EmployerController {
	
	@Autowired
	private EmployerRepo employerRepo;
	
	private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    @Autowired
    private EmployerService employerService;

    @PostMapping("/register")
    public Employer register(@RequestBody Employer employer) {
        return employerService.register(employer);
    }

    @GetMapping
    public List<Employer> getAllEmployers() {
        return employerService.getAllEmployers();
    }
    
    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path path = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/uploadImage")
    public String uploadImage(@PathVariable Long id,
                             @RequestParam("file") MultipartFile file) throws Exception {

       Employer employer = employerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir + fileName);

        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        employer.setImage(fileName);
        employerRepo.save(employer);

        return fileName;
    }
    @DeleteMapping("/{id}/deleteImage")
    public void deleteImage(@PathVariable Long id) {

        Employer employer = employerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String fileName = employer.getImage();

        try {
            if (fileName != null) {
                Path path = Paths.get(uploadDir).resolve(fileName);
                Files.deleteIfExists(path);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        employer.setImage(null);
        employerRepo.save(employer);
    }
    
    @GetMapping("/{id}")
    public EmployerDTO getEmployerById(@PathVariable Long id) {
        Employer emp = employerRepo.findById(id).orElse(null);
        if (emp == null) return null;
        return new EmployerDTO(
            emp.getId(),
            
            emp.getEmpname(),
            emp.getCompanyname(),
            emp.getEmail(),
            emp.getPhonenumber(),
            emp.getLocation(),
            emp.getWebsite(),
            emp.getIndustry(),
            emp.getCompanySize(),
            emp.getDescription(),
            emp.getHiringRoles(),
            emp.getImage()
        );
    }

    @PutMapping("/{id}")
    public Employer updateEmployer(@PathVariable Long id, @RequestBody Employer e) {
        Employer existing = employerRepo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
        if (e.getEmpname() != null) existing.setEmpname(e.getEmpname());
        if (e.getLocation() != null) existing.setLocation(e.getLocation());
        if (e.getCompanyname() != null) existing.setCompanyname(e.getCompanyname());
        if (e.getPhonenumber() != null) existing.setPhonenumber(e.getPhonenumber());
        if (e.getWebsite() != null) existing.setWebsite(e.getWebsite());
        if (e.getImage() != null) existing.setImage(e.getImage());
        if (e.getIndustry() != null) existing.setIndustry(e.getIndustry());
        if(e.getCompanySize() != null) existing.setCompanySize(e.getCompanySize());
        if (e.getDescription() != null) existing.setDescription(e.getDescription());
        if(e.getHiringRoles() != null) existing.setHiringRoles(e.getHiringRoles());
        return employerRepo.save(existing);
    }
}