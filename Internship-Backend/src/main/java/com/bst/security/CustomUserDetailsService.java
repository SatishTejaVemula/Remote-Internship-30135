package com.bst.security;

import com.bst.model.Student;
import com.bst.model.Employer;
import com.bst.repo.StudentRepo;
import com.bst.repo.EmployerRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        System.out.println("====================================");
        System.out.println("LOGIN EMAIL: " + email);

        /*
         * =====================================================
         * CHECK STUDENT
         * =====================================================
         */

        Student student =
                studentRepo.findByEmail(email).orElse(null);

        if (student != null) {

            System.out.println("USER TYPE: STUDENT");
            System.out.println("ROLE: ROLE_STUDENT");

            System.out.println("====================================");

            return new User(
                    student.getEmail(),
                    student.getPassword(),
                    List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_STUDENT"
                            )
                    )
            );
        }

        /*
         * =====================================================
         * CHECK EMPLOYER
         * =====================================================
         */

        Employer employer =
                employerRepo.findByEmail(email).orElse(null);

        if (employer != null) {

            /*
             * Your current application treats Employer
             * accounts as ADMIN accounts.
             */
            System.out.println("USER TYPE: EMPLOYER");
            System.out.println("ROLE: ROLE_ADMIN");

            System.out.println("====================================");

            return new User(
                    employer.getEmail(),
                    employer.getPassword(),
                    List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_ADMIN"
                            )
                    )
            );
        }

        /*
         * =====================================================
         * USER NOT FOUND
         * =====================================================
         */

        System.out.println(
                "USER NOT FOUND: " + email
        );

        System.out.println("====================================");

        throw new UsernameNotFoundException(
                "User not found: " + email
        );
    }
}
