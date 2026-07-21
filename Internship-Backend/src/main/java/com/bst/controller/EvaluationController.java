package com.bst.controller;

import com.bst.dto.EvaluationDTO;
import com.bst.model.Evaluation;
import com.bst.model.Task;
import com.bst.repo.StudentRepo;
import com.bst.repo.TaskRepo;
import com.bst.model.Student;
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

    @PostMapping("/evaluate")
    public Object createEvaluation(@RequestBody Map<String, String> body) {

        Long taskId = Long.parseLong(body.get("taskId"));
        Long studentId = Long.parseLong(body.get("studentId"));

        if (evaluationService.exists(studentId, taskId)) {
            return Map.of("error", "Evaluation already exists for this task");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Evaluation eval = new Evaluation();
        eval.setTask(task);
        eval.setStudent(student);

        eval.setRating(Integer.parseInt(body.get("rating")));
        eval.setTechnical(body.get("technical"));
        eval.setCommunication(body.get("communication"));
        eval.setWorkEthic(body.get("workEthic"));
        eval.setStrengths(body.get("strengths"));
        eval.setImprovements(body.get("improvements"));
        eval.setFeedback(body.get("feedback"));

        return evaluationService.save(eval);
    }

    @GetMapping("/all")
    public List<Evaluation> getAllEvaluations() {
        return evaluationService.getAll();
    }

    @GetMapping("/student/{studentId}")
    public List<EvaluationDTO> getEvaluationsByStudent(@PathVariable Long studentId) {
        return evaluationService.getEvaluationsByStudentDTO(studentId);
    }

    @GetMapping("/task/{taskId}")
    public List<Evaluation> getEvaluationsByTask(@PathVariable Long taskId) {
        return evaluationService.getByTask(taskId);
    }

    @DeleteMapping("/{id}")
    public String deleteEvaluation(@PathVariable Long id) {
        evaluationService.delete(id);
        return "Evaluation deleted successfully";
    }
}