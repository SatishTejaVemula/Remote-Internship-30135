package com.bst.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bst.dto.StudentDTO;
import com.bst.model.Student;
import com.bst.repo.StudentRepo;
import com.bst.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepo studentRepo;

    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/register")
    public Student register(@RequestBody Student student) {
        return studentService.register(student);
    }

    @PostMapping("/login")
    public Student login(@RequestParam String email,
                         @RequestParam String password) {
        return studentService.login(email, password);
    }

    @GetMapping("/{id}")
    public StudentDTO getStudent(@PathVariable Long id) {
        return studentService.getStudentDTO(id);
    }

    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student s) {

        Student existing = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (s.getName() != null) existing.setName(s.getName());
        if (s.getUniversity() != null) existing.setUniversity(s.getUniversity());
        if (s.getStream() != null) existing.setStream(s.getStream());
        if (s.getBranch() != null) existing.setBranch(s.getBranch());
        if (s.getJoiningyear() != null) existing.setJoiningyear(s.getJoiningyear());
        if (s.getGraduatedyear() != null) existing.setGraduatedyear(s.getGraduatedyear());
        if (s.getPhone() != null) existing.setPhone(s.getPhone());
        if (s.getSkills() != null) existing.setSkills(s.getSkills());
        if (s.getLinks() != null) existing.setLinks(s.getLinks());
        if (s.getResume() != null) existing.setResume(s.getResume());
        if (s.getImage() != null) existing.setImage(s.getImage());

        return studentRepo.save(existing);
    }

    @PostMapping("/{id}/uploadResume")
    public String uploadResume(@PathVariable Long id,
                              @RequestParam("file") MultipartFile file) throws Exception {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (!file.getContentType().equals("application/pdf")) {
            throw new RuntimeException("Only PDF files allowed");
        }
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());
        student.setResume(fileName);
        studentRepo.save(student);
        return fileName;
    }

    @GetMapping("/resume/{filename}")
    public ResponseEntity<Resource> getResume(@PathVariable String filename) throws Exception {

        Path path = Paths.get(uploadDir).resolve(filename);
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @DeleteMapping("/{id}/deleteResume")
    public void deleteResume(@PathVariable Long id) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        student.setResume(null);
        studentRepo.save(student);
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

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir + fileName);

        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        student.setImage(fileName);
        studentRepo.save(student);

        return fileName;
    }
    
    @DeleteMapping("/{id}/deleteImage")
    public void deleteImage(@PathVariable Long id) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String fileName = student.getImage();

        try {
            if (fileName != null) {
                Path path = Paths.get(uploadDir).resolve(fileName);
                Files.deleteIfExists(path);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        student.setImage(null);
        studentRepo.save(student);
    }
    @PutMapping("/{id}/add-skill")
    public Student addSkill(@PathVariable Long id, @RequestParam String skill) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String skillsJson = student.getSkills();

        List<String> skills = new ArrayList<>();

        try {
            if (skillsJson != null) {
                skills = new ObjectMapper().readValue(skillsJson, List.class);
            }
        } catch (Exception e) {}

        skills.add(skill);

        try {
            student.setSkills(new ObjectMapper().writeValueAsString(skills));
        } catch (Exception e) {}

        return studentRepo.save(student);
    }
    
    @PutMapping("/{id}/delete-skill")
    public Student deleteSkill(@PathVariable Long id, @RequestParam String skill) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<String> skills = new ArrayList<>();

        try {
            if (student.getSkills() != null) {
                skills = new ObjectMapper().readValue(student.getSkills(), List.class);
            }
        } catch (Exception e) {}

        skills.remove(skill);

        try {
            student.setSkills(new ObjectMapper().writeValueAsString(skills));
        } catch (Exception e) {}

        return studentRepo.save(student);
    }
    
    @PutMapping("/{id}/add-link")
    public Student addLink(@PathVariable Long id, @RequestParam String link) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<String> links = new ArrayList<>();

        try {
            if (student.getLinks() != null) {
                links = new ObjectMapper().readValue(student.getLinks(), List.class);
            }
        } catch (Exception e) {}

        links.add(link);

        try {
            student.setLinks(new ObjectMapper().writeValueAsString(links));
        } catch (Exception e) {}

        return studentRepo.save(student);
    }
    
    @PutMapping("/{id}/delete-link")
    public Student deleteLink(@PathVariable Long id, @RequestParam String link) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<String> links = new ArrayList<>();

        try {
            if (student.getLinks() != null) {
                links = new ObjectMapper().readValue(student.getLinks(), List.class);
            }
        } catch (Exception e) {}

        links.remove(link);

        try {
            student.setLinks(new ObjectMapper().writeValueAsString(links));
        } catch (Exception e) {}

        return studentRepo.save(student);
    }
}