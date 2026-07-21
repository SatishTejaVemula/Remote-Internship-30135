package com.bst.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployerRequestDTO {
	@NotEmpty(message = "Company name is required")
	private String companyName;
	@Email(message = "Email must have proper format")
    private String email;
    private String password;
    private String website;
    private String location;
}
