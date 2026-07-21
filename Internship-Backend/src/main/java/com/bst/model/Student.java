package com.bst.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;
    @Column(nullable = false)
    private Boolean verified = false;

    private String password;
    
    @JsonIgnore
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    private String stream;
    @Column()
    private String university;
    private String branch;
    @Min(2010)
    private Integer joiningyear;
    @Min(2012)
    private Integer graduatedyear;
    private String role = "student";
    
    private String phone;
    private String resume;

    @Column(columnDefinition = "LONGTEXT")
    private String skills;

    @Column(columnDefinition = "LONGTEXT")
    private String links;

    @JsonIgnore
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Application> applications;
    
    @JsonIgnore
    @OneToMany(mappedBy = "student")
    private List<Evaluation> evaluations;
    
    public boolean isVerified() {
    	   return verified;
    	}

    	public void setVerified(boolean verified) {
    	   this.verified = verified;
    	}

}