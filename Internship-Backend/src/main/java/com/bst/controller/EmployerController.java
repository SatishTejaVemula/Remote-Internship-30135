package com.bst.controller;

import com.bst.dto.EmployerDTO;
import com.bst.model.Employer;
import com.bst.repo.EmployerRepo;
import com.bst.service.EmployerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    @Autowired
    private EmployerService employerService;

    @PostMapping("/register")
    public Employer register(
            @RequestBody Employer employer) {

        return employerService.register(employer);
    }


    @GetMapping
    public List<Employer> getAllEmployers() {

        return employerService.getAllEmployers();
    }

    @GetMapping("/{id}")
    public EmployerDTO getEmployerById(
            @PathVariable Long id) {

        Employer emp =
                employerRepo.findById(id)
                        .orElse(null);

        if (emp == null) {
            return null;
        }

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

    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> getImage(
            @PathVariable String filename) {

        try {
            if (filename == null ||
                    filename.isBlank() ||
                    "default".equalsIgnoreCase(filename)) {

                return ResponseEntity.notFound().build();
            }
            String safeFileName =
                    Paths.get(filename)
                            .getFileName()
                            .toString();

            Path path =
                    Paths.get(uploadDir)
                            .resolve(safeFileName)
                            .normalize();

            System.out.println(
                    "Admin image requested: "
                            + safeFileName);

            System.out.println(
                    "Admin image path: "
                            + path.toAbsolutePath());

            Resource resource =
                    new UrlResource(
                            path.toUri());

            if (!resource.exists() ||
                    !resource.isReadable()) {

                System.out.println(
                        "ADMIN IMAGE NOT FOUND: "
                                + path.toAbsolutePath());

                return ResponseEntity
                        .notFound()
                        .build();
            }
            String contentType =
                    Files.probeContentType(path);

            if (contentType == null) {

                String lower =
                        safeFileName.toLowerCase();

                if (lower.endsWith(".png")) {

                    contentType = "image/png";

                } else if (
                        lower.endsWith(".jpg") ||
                        lower.endsWith(".jpeg")) {

                    contentType = "image/jpeg";

                } else if (
                        lower.endsWith(".gif")) {

                    contentType = "image/gif";

                } else if (
                        lower.endsWith(".webp")) {

                    contentType = "image/webp";

                } else {

                    contentType =
                            "application/octet-stream";
                }
            }

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    contentType))
                    .header(
                            HttpHeaders.CACHE_CONTROL,
                            "max-age=3600")
                    .body(resource);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }
    @PostMapping("/{id}/uploadImage")
    public String uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file)
            throws Exception {

        Employer employer =
                employerRepo.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employer not found"));
        if (file == null ||
                file.isEmpty()) {

            throw new RuntimeException(
                    "Image file is empty");
        }
        String contentType =
                file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed");
        }
        Path uploadPath =
                Paths.get(uploadDir);

        Files.createDirectories(
                uploadPath);

        String oldFileName =
                employer.getImage();

        if (oldFileName != null &&
                !oldFileName.isBlank() &&
                !"default".equalsIgnoreCase(
                        oldFileName)) {

            try {

                Path oldPath =
                        uploadPath
                                .resolve(
                                        Paths.get(
                                                oldFileName)
                                                .getFileName()
                                                .toString())
                                .normalize();

                Files.deleteIfExists(
                        oldPath);

            } catch (Exception e) {

                System.out.println(
                        "Could not delete old admin image");

                e.printStackTrace();
            }
        }
        String originalName =
                file.getOriginalFilename();

        if (originalName == null ||
                originalName.isBlank()) {

            originalName =
                    "company-logo";
        }
        originalName =
                Paths.get(originalName)
                        .getFileName()
                        .toString();
        String fileName =
                System.currentTimeMillis()
                        + "_"
                        + originalName;
        Path path =
                uploadPath
                        .resolve(fileName)
                        .normalize();
        Files.write(
                path,
                file.getBytes());
        employer.setImage(fileName);

        employerRepo.save(employer);


        return fileName;
    }
    @DeleteMapping("/{id}/deleteImage")
    public void deleteImage(
            @PathVariable Long id) {

        Employer employer =
                employerRepo.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employer not found"));

        String fileName =
                employer.getImage();

        if (fileName != null &&
                !fileName.isBlank() &&
                !"default".equalsIgnoreCase(
                        fileName)) {

            try {

                Path path =
                        Paths.get(uploadDir)
                                .resolve(
                                        Paths.get(
                                                fileName)
                                                .getFileName()
                                                .toString())
                                .normalize();

                Files.deleteIfExists(path);

            } catch (Exception e) {

                e.printStackTrace();
            }
        }

        employer.setImage(null);

        employerRepo.save(employer);
    }
    @PutMapping("/{id}")
    public Employer updateEmployer(
            @PathVariable Long id,
            @RequestBody Employer e) {

        Employer existing =
                employerRepo.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employer not found"));

        if (e.getEmpname() != null) {
            existing.setEmpname(
                    e.getEmpname());
        }

        if (e.getLocation() != null) {
            existing.setLocation(
                    e.getLocation());
        }

        if (e.getCompanyname() != null) {
            existing.setCompanyname(
                    e.getCompanyname());
        }

        if (e.getPhonenumber() != null) {
            existing.setPhonenumber(
                    e.getPhonenumber());
        }

        if (e.getWebsite() != null) {
            existing.setWebsite(
                    e.getWebsite());
        }

        if (e.getImage() != null) {
            existing.setImage(
                    e.getImage());
        }

        if (e.getIndustry() != null) {
            existing.setIndustry(
                    e.getIndustry());
        }

        if (e.getCompanySize() != null) {
            existing.setCompanySize(
                    e.getCompanySize());
        }

        if (e.getDescription() != null) {
            existing.setDescription(
                    e.getDescription());
        }

        if (e.getHiringRoles() != null) {
            existing.setHiringRoles(
                    e.getHiringRoles());
        }

        return employerRepo.save(existing);
    }
}