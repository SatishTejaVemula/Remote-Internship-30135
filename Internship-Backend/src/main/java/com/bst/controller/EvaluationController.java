package com.bst.controller;

import com.bst.dto.EvaluationDTO;
import com.bst.model.Evaluation;
import com.bst.model.Student;
import com.bst.model.Task;
import com.bst.repo.StudentRepo;
import com.bst.repo.TaskRepo;
import com.bst.service.EvaluationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private TaskRepo taskRepository;

    @Autowired
    private StudentRepo studentRepository;

    // =========================================
    // CREATE EVALUATION
    // EMPLOYER
    // =========================================

    @PostMapping("/evaluate")
    public Object createEvaluation(
            @RequestBody Map<String, String> body) {

        Long taskId =
                Long.parseLong(
                        body.get("taskId")
                );

        Long studentId =
                Long.parseLong(
                        body.get("studentId")
                );

        // =========================================
        // CHECK DUPLICATE
        // =========================================

        if (evaluationService.exists(
                studentId,
                taskId)) {

            return Map.of(
                    "error",
                    "Evaluation already exists for this task"
            );
        }

        // =========================================
        // FIND TASK
        // =========================================

        Task task =
                taskRepository.findById(taskId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Task not found"
                                )
                        );

        // =========================================
        // FIND STUDENT
        // =========================================

        Student student =
                studentRepository.findById(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student not found"
                                )
                        );

        // =========================================
        // CREATE EVALUATION
        // =========================================

        Evaluation evaluation =
                new Evaluation();

        evaluation.setTask(task);
        evaluation.setStudent(student);

        evaluation.setRating(
                Integer.parseInt(
                        body.get("rating")
                )
        );

        evaluation.setTechnical(
                body.get("technical")
        );

        evaluation.setCommunication(
                body.get("communication")
        );

        evaluation.setWorkEthic(
                body.get("workEthic")
        );

        evaluation.setStrengths(
                body.get("strengths")
        );

        evaluation.setImprovements(
                body.get("improvements")
        );

        evaluation.setFeedback(
                body.get("feedback")
        );

        return evaluationService.save(
                evaluation
        );
    }

    // =========================================
    // GET ALL EVALUATIONS
    // EMPLOYER
    // =========================================

    @GetMapping("/all")
    public List<Evaluation> getAllEvaluations() {

        return evaluationService.getAll();
    }

    // =========================================
    // GET EVALUATIONS BY STUDENT
    // STUDENT
    // =========================================

    @GetMapping("/student/{studentId}")
    public List<EvaluationDTO> getEvaluationsByStudent(
            @PathVariable Long studentId) {

        return evaluationService
                .getEvaluationsByStudentDTO(
                        studentId
                );
    }

    // =========================================
    // GET EVALUATIONS BY TASK
    // EMPLOYER
    // =========================================

    @GetMapping("/task/{taskId}")
    public List<Evaluation> getEvaluationsByTask(
            @PathVariable Long taskId) {

        return evaluationService.getByTask(
                taskId
        );
    }

    // =========================================
    // DELETE EVALUATION
    // EMPLOYER
    // =========================================

    @DeleteMapping("/{id}")
    public String deleteEvaluation(
            @PathVariable Long id) {

        evaluationService.delete(id);

        return "Evaluation deleted successfully";
    }

    @GetMapping("/employer/{employerId}")
    public List<Evaluation> getEvaluationsByEmployer(
            @PathVariable Long employerId) {

        return evaluationService.getByEmployer(employerId);
    }
}