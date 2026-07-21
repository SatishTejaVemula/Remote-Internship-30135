package com.bst.service;

import com.bst.dto.StudentDTO;
import com.bst.model.Student;
import com.bst.repo.StudentRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Student register(Student student) {

        Optional<Student> existing = studentRepo.findByEmail(student.getEmail());

        if (existing.isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        student.setPassword(passwordEncoder.encode(student.getPassword()));

        return studentRepo.save(student);
    }

    @Override
    public Student login(String email, String password) {

        Student student = studentRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found. Please register."));

        if (!passwordEncoder.matches(password, student.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return student;
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    @Override
    public Student getStudentById(Long id) {
        return studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @Override
    public void deleteStudent(Long id) {
        studentRepo.deleteById(id);
    }
    
    @Override
    public Student updateStudent(Long id, Student updatedStudent) {
        Student student = studentRepo.findById(id).orElseThrow();

        student.setName(updatedStudent.getName());
        student.setEmail(updatedStudent.getEmail());
        student.setUniversity(updatedStudent.getUniversity());

        if (updatedStudent.getImage() != null) {
            student.setImage(updatedStudent.getImage());
        }

        return studentRepo.save(student);
    }
    
    public StudentDTO getStudentDTO(Long id) {

        Student s = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        StudentDTO dto = new StudentDTO();

        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setEmail(s.getEmail());

        dto.setUniversity(s.getUniversity());
        dto.setStream(s.getStream());
        dto.setBranch(s.getBranch());

        dto.setJoiningyear(s.getJoiningyear());
        dto.setGraduatedyear(s.getGraduatedyear());

        dto.setPhone(s.getPhone());
        dto.setImage(s.getImage());

        dto.setSkills(s.getSkills());
        dto.setLinks(s.getLinks());

        dto.setResume(s.getResume());

        return dto;
    }
}