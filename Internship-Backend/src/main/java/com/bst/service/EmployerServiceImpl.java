package com.bst.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bst.model.Employer;
import com.bst.repo.EmployerRepo;

@Service
public class EmployerServiceImpl implements EmployerService {

    @Autowired
    private EmployerRepo employerRepository;

    @Autowired
    PasswordEncoder encoder;

    public Employer register(
    Employer employer
    ){
     employer.setPassword(
       encoder.encode(
        employer.getPassword()
       )
     );
     return employerRepository.save(employer);
    }

    @Override
    public List<Employer> getAllEmployers() {
        return employerRepository.findAll();
    }

    @Override
    public Employer getEmployerById(Long id) {
        return employerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employer not found"));
    }
}