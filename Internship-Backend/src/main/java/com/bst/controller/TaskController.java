package com.bst.controller;

import com.bst.dto.TaskDTO;
import com.bst.model.Task;
import com.bst.repo.TaskRepo;
import com.bst.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepo taskRepo;


    @PostMapping
    public Task assignTask(@RequestBody Map<String, String> body) {

        Long studentId = Long.parseLong(body.get("studentId"));
        Long internshipId = Long.parseLong(body.get("internshipId"));

        return taskService.assignTask(
            studentId,
            internshipId,
            body.get("title"),
            body.get("description")
        );
    }

    @GetMapping("/student/{studentId}/internship/{internshipId}")
    public List<TaskDTO> getTasks(@PathVariable Long studentId,
                                  @PathVariable Long internshipId) {
        return taskService.getTasksByStudentAndInternshipDTO(studentId, internshipId);
    }
    
    @GetMapping("/student/{studentId}")
    public List<TaskDTO> getTasksByStudent(@PathVariable Long studentId) {
        return taskService.getTasksByStudentDTO(studentId);
    }

    @PutMapping("/submit/{taskId}")
    public ResponseEntity<?> submitTask(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body
    ) {
        Task task = taskRepo.findById(taskId).orElse(null);

        if (task == null) {
            return ResponseEntity.status(404).body("Task not found");
        }

        task.setStatus("COMPLETED");
        task.setSubmissionDescription(body.get("description"));
        task.setSubmissionFileName(body.get("fileName"));
        task.setSubmissionFileData(body.get("fileData"));

        taskRepo.save(task);

        return ResponseEntity.ok("Task submitted successfully");
    }

    @PutMapping("{taskId}")
    public Task deleteSubmission(@PathVariable Long taskId) {
        Task task = taskRepo.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setSubmissionDescription(null);
        task.setSubmissionFileName(null);
        task.setSubmissionFileData(null);
        task.setStatus("PENDING");

        return taskRepo.save(task);
    }
    
    @GetMapping("/file/{taskId}")
    public ResponseEntity<byte[]> getFile(@PathVariable Long taskId) {

        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getSubmissionFileData() == null) {
            throw new RuntimeException("No file found");
        }

        String base64Data = task.getSubmissionFileData().split(",")[1];

        byte[] fileBytes = Base64.getDecoder().decode(base64Data);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + task.getSubmissionFileName())
                .body(fileBytes);
    }
}