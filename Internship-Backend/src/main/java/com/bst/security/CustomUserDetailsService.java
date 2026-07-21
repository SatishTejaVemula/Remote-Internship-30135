package com.bst.security;

import com.bst.model.Student;
import com.bst.model.Employer;

import com.bst.repo.StudentRepo;
import com.bst.repo.EmployerRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	@Autowired
	private StudentRepo studentRepo;

	@Autowired
	private EmployerRepo employerRepo;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

		Student student = studentRepo.findByEmail(email).orElse(null);

		if (student != null) {

			return new User(student.getEmail(), student.getPassword(),

					List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
		}

		Employer employer = employerRepo.findByEmail(email).orElse(null);

		if (employer != null) {

			return new User(employer.getEmail(), employer.getPassword(),

					List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
		}

		throw new UsernameNotFoundException("User not found: " + email);
	}
}