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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getStream() {
        return stream;
    }

    public void setStream(String stream) {
        this.stream = stream;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public Integer getJoiningyear() {
        return joiningyear;
    }

    public void setJoiningyear(Integer joiningyear) {
        this.joiningyear = joiningyear;
    }

    public Integer getGraduatedyear() {
        return graduatedyear;
    }

    public void setGraduatedyear(Integer graduatedyear) {
        this.graduatedyear = graduatedyear;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getResume() {
        return resume;
    }

    public void setResume(String resume) {
        this.resume = resume;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getLinks() {
        return links;
    }

    public void setLinks(String links) {
        this.links = links;
    }

    public List<Application> getApplications() {
        return applications;
    }

    public void setApplications(List<Application> applications) {
        this.applications = applications;
    }

    public List<Evaluation> getEvaluations() {
        return evaluations;
    }

    public void setEvaluations(List<Evaluation> evaluations) {
        this.evaluations = evaluations;
    }

}