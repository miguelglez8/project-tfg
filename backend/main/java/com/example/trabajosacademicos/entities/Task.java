package com.example.trabajosacademicos.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "The 'name' field cannot be blank")
    @Length(max = 255, message = "The 'name' field cannot have more than 255 characters")
    private String name;
    @Length(max = 255, message = "The 'subject' field cannot have more than 255 characters")
    private String subject;
    private String attachedResources;
    @DateTimeFormat
    @Future(message = "The 'deadlineDateTime' field must be after the current date")
    private LocalDateTime deadlineDateTime;
    @ManyToOne
    private Job job;
    @ElementCollection
    private List<Objective> objectivesList = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "task_status_id")
    private TaskStatus taskStatus;
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;
    @ManyToMany
    @JoinTable(
            name = "users_tasks",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users = new ArrayList<>();
    private Integer orderNumber;
    @Pattern(regexp = "^(100|[0-9]{1,2})$", message = "The 'percentage' field must be a number between 0 and 100")
    private int percentage;
}
