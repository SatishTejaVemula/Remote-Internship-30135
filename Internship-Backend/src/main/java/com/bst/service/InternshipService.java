package com.bst.service;

import java.util.List;
import com.bst.model.Internship;

public interface InternshipService {

    Internship createInternship(Internship internship, Long employerId);

    List<Internship> getAllInternships();

    Internship getInternshipById(Long id);

    void deleteInternship(Long id);

    List<Internship> getByEmployerId(Long employerId);
}