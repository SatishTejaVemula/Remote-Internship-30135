package com.bst.repo;

import com.bst.model.Evaluation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepo extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByStudentId(Long studentId);

    Optional<Evaluation> findByStudentIdAndTaskId(Long studentId, Long taskId);
    
    List<Evaluation> findByTaskId(Long taskId);

	void deleteByTaskId(Long id);
}