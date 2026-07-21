package com.bst.dto;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDTO {

    private Long id;
    private String name;
    private String email;

    private String university;
    private String stream;
    private String branch;
    private String image;

    private Integer joiningyear;
    private Integer graduatedyear;

    private String phone;

    private String skills;
    private String links;

    private String resume;
}