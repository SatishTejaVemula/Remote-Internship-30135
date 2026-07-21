package com.bst.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployerDTO {

    private Long id;
    private String empname;
    private String companyname;
    private String email;
    private String phonenumber;

    private String location;
    private String website;

    private String industry;
    private String companySize;
    private String description;

    private String hiringRoles;

    private String image;
}