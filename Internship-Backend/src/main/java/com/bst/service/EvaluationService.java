package com.bst.service;

import com.bst.dto.EvaluationDTO;
import com.bst.model.Evaluation;
import com.bst.model.Student;
import com.bst.model.Task;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

public interface EvaluationService {

    Evaluation save(Evaluation evaluation);

    List<Evaluation> getAll();

    List<Evaluation> getByStudent(Long studentId);

    List<Evaluation> getByTask(Long taskId);
    
    boolean exists(Long studentId, Long taskId);
    
    List<EvaluationDTO> getEvaluationsByStudentDTO(Long studentId);
    
    List<Task> findByInternshipId(Long internshipId);
    
	void deleteByTaskId(Long id);

    public void delete(Long id);

}