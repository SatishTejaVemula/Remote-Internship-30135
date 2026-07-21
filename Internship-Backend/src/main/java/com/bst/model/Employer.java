package com.bst.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "employer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String empname;
    private String companyname;
    private String phonenumber;

    @Column(unique = true)
    private String email;
    @Column(nullable = false)
    private Boolean verified = false;
    
    @JsonIgnore
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    private String password;

    private String location;

    private String website;
    
    @Column
    private String industry;

    @Column
    private String companySize;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String hiringRoles;

    @OneToMany(mappedBy = "employer", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"internships"})
    private List<Internship> internships;
    
    public boolean isVerified() {
    	   return verified;
    	}

    	public void setVerified(boolean verified) {
    	   this.verified = verified;
    	}
}