package com.bst.repo;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bst.model.Application;
import com.bst.model.Student;

public interface ApplicationRepo extends JpaRepository<Application,Long>{

 List<Application> findByStudentId(Long studentId);

 List<Application> findByInternshipId(Long internshipId);
 
 Optional<Application> findByStudentIdAndInternshipId(Long studentId, Long internshipId);
 
 List<Application> findByInternshipEmployerId(Long employerId);
 
 @Query("SELECT a FROM Application a " +
	       "JOIN FETCH a.internship i " +
	       "JOIN FETCH i.employer " +
	       "WHERE a.student.id = :studentId")
	List<Application> findByStudentIdWithInternship(@Param("studentId") Long studentId);
}