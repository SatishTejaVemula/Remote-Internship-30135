package com.bst.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bst.repo.StudentRepo;
import com.bst.repo.EmployerRepo;
import com.bst.model.Student;
import com.bst.model.Employer;
import com.bst.util.OtpGeneration;

@Service
public class OtpService {

    @Autowired
    private EmailOtpService emailService;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private EmployerRepo employerRepo;

    private Map<String, String> otpStorage = new HashMap<>();

    public String sendOtp(String email) {

        System.out.println("Step 1");

        String otp = OtpGeneration.getOtp();

        System.out.println("Generated OTP: " + otp);

        otpStorage.put(email, otp);

        System.out.println("Calling EmailOtpService...");

        emailService.sendOtpEmail(email, otp);

        System.out.println("Email sent successfully");

        return "OTP sent to email";
    }

    // VERIFY OTP
    public String verifyOtp(String email, String enteredOtp) {

        String storedOtp = otpStorage.get(email);

        if (storedOtp == null) {
            return "OTP not found. Please request again";
        }

        if (storedOtp.equals(enteredOtp)) {

            otpStorage.remove(email);

            Student student = studentRepo
                    .findByEmail(email)
                    .orElse(null);

            if (student != null) {
                student.setVerified(true);
                studentRepo.save(student);
            }

            Employer emp = employerRepo
                    .findByEmail(email)
                    .orElse(null);

            if (emp != null) {
                emp.setVerified(true);
                employerRepo.save(emp);
            }

            return "OTP Verified Successfully";
        }

        return "Invalid OTP";
    }

}