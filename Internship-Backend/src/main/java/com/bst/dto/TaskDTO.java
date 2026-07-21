package com.bst.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {

    private Long id;
    private String title;
    private String description;
    private String status;

    private String submissionDescription;
    private String submissionFileName;

    private String internshipTitle;
}