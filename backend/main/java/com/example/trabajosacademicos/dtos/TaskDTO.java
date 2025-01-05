package com.example.trabajosacademicos.dtos;

import com.example.trabajosacademicos.entities.Objective;
import jakarta.persistence.ElementCollection;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
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
    @NotBlank(message = "The 'associatedAcademicWork' field cannot be blank")
    private String associatedAcademicWork;
    @ElementCollection
    private Objective[] objectivesList;
    @NotBlank(message = "The 'taskStatus' field cannot be blank")
    private Long taskStatus;
    @NotBlank(message = "The 'difficultyLevel' field cannot be blank")
    private String difficultyLevel;
    @NotEmpty(message = "The 'assignedTo' field cannot be empty")
    private String[] assignedTo;
    private Integer orderNumber;
    @Pattern(regexp = "^(100|[0-9]{1,2})$", message = "The 'percentage' field must be a number between 0 and 100")
    private int percentage;
}
