package com.example.trabajosacademicos.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FriendshipDTO {
    private Long id;
    @NotBlank(message = "The 'senderEmail' field cannot be empty")
    @Email(message = "The 'senderEmail' field must be a valid email address")
    private String senderEmail;
    @NotBlank(message = "The 'receiverEmail' field cannot be empty")
    @Email(message = "The 'receiverEmail' field must be a valid email address")
    private String receiverEmail;
    @Length(max = 255, message = "The 'message' field cannot exceed 255 characters")
    private String message;
    @DateTimeFormat
    private Date date;
}
