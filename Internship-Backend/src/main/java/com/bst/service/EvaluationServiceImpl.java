package com.bst.service;

import com.bst.dto.EvaluationDTO;
import com.bst.model.Evaluation;
import com.bst.model.Student;
import com.bst.model.Task;
import com.bst.repo.EvaluationRepo;
import com.bst.repo.TaskRepo;
import com.bst.repo.ApplicationRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EvaluationServiceImpl implements EvaluationService {

    @Autowired
    private EvaluationRepo evaluationRepo;
    
    @Autowired
    private TaskRepo taskRepo;

    @Autowired
    private ApplicationRepo applicationRepo;

    @Override
    public Evaluation save(Evaluation evaluation) {
        return evaluationRepo.save(evaluation);
    }

    @Override
    public List<Evaluation> getAll() {
        return evaluationRepo.findAll();
    }

    @Override
    public List<Evaluation> getByStudent(Long studentId) {
        return evaluationRepo.findByStudentId(studentId);
    }

    @Override
    public List<Evaluation> getByTask(Long taskId) {
        return evaluationRepo.findByTaskId(taskId);
    }

    @Override
    public boolean exists(Long studentId, Long taskId) {
        return evaluationRepo
            .findByStudentIdAndTaskId(studentId, taskId)
            .isPresent();
    }

    @Override
    public void delete(Long id) {
        evaluationRepo.deleteById(id);
    }
    
    public List<EvaluationDTO> getEvaluationsByStudentDTO(Long studentId) {

        List<Evaluation> evaluations =
                evaluationRepo.findByStudentId(studentId);

        return evaluations.stream().map(eval -> {

            EvaluationDTO dto = new EvaluationDTO();

            dto.setId(eval.getId());
            dto.setRating(eval.getRating());
            dto.setTechnical(eval.getTechnical());
            dto.setCommunication(eval.getCommunication());
            dto.setWorkEthic(eval.getWorkEthic());
            dto.setInternshipTitle(eval.getTask().getInternship().getTitle());
            dto.setStrengths(eval.getStrengths());
            dto.setImprovements(eval.getImprovements());
            dto.setFeedback(eval.getFeedback());
            dto.setTaskTitle(
                eval.getTask() != null
                    ? eval.getTask().getTitle()
                    : "Task"
            );

            return dto;

        }).toList();
    }

	@Override
	public List<Task> findByInternshipId(Long internshipId) {
		// TODO Auto-generated method stub
		return taskRepo.findByInternshipId(internshipId);
	}

	@Override
	public void deleteByTaskId(Long id) {
		// TODO Auto-generated method stub
		taskRepo.deleteById(id);
	}

}