package com.bst.model;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "internship")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String companyname;

    private String duration;

    private String location;

    private String stipend;

    @Column(length = 5000)
    private String description;

    @Column(length = 5000)
    private String requirements;

    @Column(length = 5000)
    private String skills;
    
    @JsonManagedReference
    @JsonIgnore
    @OneToMany(mappedBy = "internship", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"internships"})
    @JoinColumn(name = "employer_id")
    private Employer employer;
}