package com.bst.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationDTO {

    private Long id;
    private int rating;

    private String technical;
    private String communication;
    private String workEthic;

    private String strengths;
    private String improvements;
    private String feedback;

    private String taskTitle;
    private String internshipTitle;
}