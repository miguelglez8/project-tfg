package com.example.trabajosacademicos.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CallDTO {
    private Long id;
    @NotBlank(message = "The 'firstName' field cannot be blank")
    private String firstName;
    @NotBlank(message = "The 'lastName' field cannot be blank")
    private String lastName;
    @NotBlank(message = "The 'userCall' field cannot be empty")
    @Email(message = "The 'userCall' field must be a valid email address")
    private String userCall;
    @NotBlank(message = "The 'type' field cannot be blank")
    private String type;
    private String duration;
    @DateTimeFormat
    private LocalDateTime date;
    @NotBlank(message = "The 'callType' field cannot be blank")
    private String callType;
    @NotBlank(message = "The 'userCalled' field cannot be empty")
    @Email(message = "The 'userCalled' field must be a valid email address")
    private String userCalled;
}
