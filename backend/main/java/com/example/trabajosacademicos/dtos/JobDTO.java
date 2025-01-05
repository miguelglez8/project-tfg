package com.example.trabajosacademicos.dtos;

import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JobDTO {
    private Long id;
    @NotBlank(message = "The 'creator' field cannot be blank")
    @Length(max = 255, message = "The 'creator' field cannot have more than 255 characters")
    private String creator;
    @NotBlank(message = "The 'title' field cannot be blank")
    private String title;
    @NotBlank(message = "The 'description' field cannot be blank")
    @Length(max = 255, message = "The 'description' field cannot have more than 255 characters")
    private String description;
    @NotBlank(message = "The 'type' field cannot be blank")
    private String type;
    @NotBlank(message = "The 'priority' field cannot be blank")
    private String priority;
    @Length(max = 255, message = "The 'relatedSubject' field cannot have more than 255 characters")
    private String relatedSubject;
    @DateTimeFormat
    @Future(message = "The 'deadlineDateTime' field must be after the current date")
    private LocalDateTime deadlineDateTime;
    @Min(0)
    @Max(10)
    private double note;
}
