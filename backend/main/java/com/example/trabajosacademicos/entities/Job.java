package com.example.trabajosacademicos.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    @NotBlank(message = "The 'title' field cannot be blank")
    @Length(max = 255, message = "The 'title' field cannot have more than 255 characters")
    private String title;
    @NotBlank(message = "The 'description' field cannot be blank")
    @Length(max = 255, message = "The 'description' field cannot have more than 255 characters")
    private String description;
    @Enumerated(EnumType.STRING)
    private JobType type;
    @Enumerated(EnumType.STRING)
    private JobPriority priority;
    @Length(max = 255, message = "The 'relatedSubject' field cannot have more than 255 characters")
    private String relatedSubject;
    @DateTimeFormat
    @Future(message = "The 'deadlineDateTime' field must be after the current date")
    private LocalDateTime deadlineDateTime;
    @OneToMany(mappedBy = "job")
    private List<JobUserRelation> jobUserRelations = new ArrayList<>();
    @OneToMany(mappedBy = "job")
    private List<JobInquirie> jobInquiries = new ArrayList<>();
    @OneToMany(mappedBy = "job")
    private List<Task> tasks = new ArrayList<>();
    @OneToMany(mappedBy = "job")
    private List<Event> events = new ArrayList<>();
    @Min(0)
    @Max(10)
    private double note;
}
