package com.bst.repo;

import com.bst.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepo extends JpaRepository<Task, Long> {

	List<Task> findByStudentId(Long studentId);
	List<Task> findByStudentIdAndInternshipId(Long studentId, Long internshipId);
	void deleteByInternshipId(Long id);
	List<Task> findByInternshipId(Long internshipId);
}