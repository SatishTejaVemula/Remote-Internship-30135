package com.bst.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployerResponseDTO {
	private Long id;
	private String companyNam;
	private String email;
	private String website;
	private String location;
	
}
