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
public class NotificationDTO {
    private int id;
    @NotBlank(message = "The 'type' field cannot be blank")
    private String type;
    @NotBlank(message = "The 'receiver' field cannot be blank")
    @Email(message = "The 'receiver' field must be a valid email address")
    private String receiver;
    @NotBlank(message = "The 'sender' field cannot be blank")
    private String sender;
    private boolean read;
    private boolean hidden;
    @DateTimeFormat
    private LocalDateTime date;
    private String titleTeam;
}
