package com.bst.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bst.model.Employer;

public interface EmployerRepo extends JpaRepository<Employer, Long>{
	Optional<Employer> findByEmail(String email);
}
