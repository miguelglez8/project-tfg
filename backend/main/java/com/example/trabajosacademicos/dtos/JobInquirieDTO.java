package com.example.trabajosacademicos.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JobInquirieDTO {
    private Long id;
    @NotBlank(message = "The 'sender' field cannot be empty")
    @Email(message = "The 'sender' field must be a valid email address")
    private String sender;
    @NotBlank(message = "The 'receiver' field cannot be blank")
    @Pattern(regexp = "^[A-Za-z]+$", message = "The 'receiver' must consist of letters only")
    private String receiver;
    @Length(max = 255, message = "The 'message' field cannot have more than 255 characters")
    private String message;
    @DateTimeFormat
    private Date date;
}
