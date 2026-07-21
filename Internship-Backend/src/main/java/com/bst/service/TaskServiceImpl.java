package com.bst.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bst.dto.TaskDTO;
import com.bst.model.*;
import com.bst.repo.*;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepo taskRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private InternshipRepo internshipRepo;

    @Override
    public Task assignTask(Long studentId, Long internshipId, String title, String description) {

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Internship internship = internshipRepo.findById(internshipId)
                .orElseThrow(() -> new RuntimeException("Internship not found"));

        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus("PENDING");
        task.setStudent(student);
        task.setInternship(internship);

        return taskRepo.save(task);
    }

    @Override
    public List<Task> getTasksByStudentAndInternship(Long studentId, Long internshipId) {
        return taskRepo.findByStudentIdAndInternshipId(studentId, internshipId);
    }

    @Override
    public List<Task> findByInternshipId(Long internshipId) {
        return taskRepo.findByInternshipId(internshipId);
    }

    @Override
    public void deleteByInternshipId(Long internshipId) {
        taskRepo.deleteByInternshipId(internshipId);
    }
    
    @Override
    public List<TaskDTO> getTasksByStudentDTO(Long studentId) {

        List<Task> tasks = taskRepo.findByStudentId(studentId);

        return tasks.stream().map(task -> {

            TaskDTO dto = new TaskDTO();

            dto.setId(task.getId());
            dto.setTitle(task.getTitle());
            dto.setDescription(task.getDescription());
            dto.setStatus(task.getStatus());
            dto.setSubmissionDescription(task.getSubmissionDescription());
            dto.setSubmissionFileName(task.getSubmissionFileName());

            dto.setInternshipTitle(
                task.getInternship() != null
                    ? task.getInternship().getTitle()
                    : null
            );

            return dto;

        }).toList();
    }
    
    @Override
    public List<TaskDTO> getTasksByStudentAndInternshipDTO(Long studentId, Long internshipId) {
        List<Task> tasks = taskRepo.findByStudentIdAndInternshipId(studentId, internshipId);
        return tasks.stream().map(task -> {
            TaskDTO dto = new TaskDTO();
            dto.setId(task.getId());
            dto.setTitle(task.getTitle());
            dto.setDescription(task.getDescription());
            dto.setStatus(task.getStatus());
            dto.setSubmissionDescription(task.getSubmissionDescription());
            dto.setSubmissionFileName(task.getSubmissionFileName());
            return dto;
        }).toList();
    }
}