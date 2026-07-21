package com.bst.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bst.model.Employer;
import com.bst.model.Internship;
import com.bst.model.Task;
import com.bst.repo.EmployerRepo;
import com.bst.repo.EvaluationRepo;
import com.bst.repo.InternshipRepo;
import com.bst.repo.TaskRepo;

@Service
public class InternshipServiceImpl implements InternshipService {

    @Autowired
    private InternshipRepo internshipRepo;

    @Autowired
    private EmployerRepo employerRepo;

    @Autowired
    private TaskRepo taskRepo;

    @Autowired
    private EvaluationRepo evaluationRepo;

    @Override
    public Internship createInternship(Internship internship, Long employerId) {
        Employer employer = employerRepo.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        internship.setEmployer(employer);
        return internshipRepo.save(internship);
    }

    @Override
    public List<Internship> getAllInternships() {
        return internshipRepo.findAll();
    }

    @Override
    public Internship getInternshipById(Long id) {
        return internshipRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found"));
    }

    @Override
    @Transactional
    public void deleteInternship(Long id) {

        Internship internship = internshipRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found"));

        List<Task> tasks = taskRepo.findByInternshipId(id);
        for (Task task : tasks) {
            evaluationRepo.deleteByTaskId(task.getId());
        }
        taskRepo.deleteByInternshipId(id);
        internshipRepo.delete(internship);
    }

    @Override
    public List<Internship> getByEmployerId(Long employerId) {
        return internshipRepo.findByEmployerId(employerId);
    }
}