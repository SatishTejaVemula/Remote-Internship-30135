package com.bst.service;

import java.util.List;
import com.bst.model.Employer;

public interface EmployerService {

    Employer register(Employer employer);

    List<Employer> getAllEmployers();

    Employer getEmployerById(Long id);
}