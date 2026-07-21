package com.bst.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bst.model.Developer;
import com.bst.model.Student;

public interface DeveloperRepo extends JpaRepository<Developer, Integer>{

	Optional<Developer> findByEmail(String email);

}
