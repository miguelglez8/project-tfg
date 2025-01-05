package com.example.trabajosacademicos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmailRequest {
    @NotBlank(message = "The 'to' field cannot be empty")
    @Email(message = "The 'to' field must be a valid email address")
    private String to;
    @NotBlank(message = "The 'subject' field cannot be empty")
    private String subject;
    @NotBlank(message = "The 'text' field cannot be empty")
    private String text;
    private boolean confirm = false;
    private String i18n = "es";
}
