package com.bst.service;

import java.util.List;

import com.bst.dto.TaskDTO;
import com.bst.model.Task;

public interface TaskService {

    Task assignTask(Long studentId, Long internshipId, String title, String description);

    List<Task> getTasksByStudentAndInternship(Long studentId, Long internshipId);

    List<Task> findByInternshipId(Long internshipId);

    void deleteByInternshipId(Long internshipId);
    
    List<TaskDTO> getTasksByStudentDTO(Long studentId);
    
    List<TaskDTO> getTasksByStudentAndInternshipDTO(Long studentId, Long internshipId);
}