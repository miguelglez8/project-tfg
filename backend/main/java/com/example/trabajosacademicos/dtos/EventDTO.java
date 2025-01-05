package com.example.trabajosacademicos.dtos;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EventDTO {
    private Long id;
    @NotBlank(message = "The 'name' field cannot be blank")
    @Length(max = 255, message = "The 'name' field cannot have more than 255 characters")
    private String name;
    @Length(max = 255, message = "The 'subject' field cannot have more than 255 characters")
    private String subject;
    private String attachedResources;
    @DateTimeFormat
    @Future(message = "The 'deadlineDateTimeInit' field must be after the current date")
    private LocalDateTime deadlineDateTimeInit;
    @DateTimeFormat
    @Future(message = "The 'deadlineDateTimeFin' field must be after the current date")
    private LocalDateTime deadlineDateTimeFin;
    @NotBlank(message = "The 'associatedAcademicWork' field cannot be blank")
    private String associatedAcademicWork;
    @NotEmpty(message = "The 'assignedTo' field cannot be empty")
    private String[] assignedTo;
    private boolean allDay;
    private String location;

}
