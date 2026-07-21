package com.bst.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bst.model.Internship;

public interface InternshipRepo extends JpaRepository<Internship, Long> {
	
	List<Internship> findByEmployerId(Long employerId);

}