package com.example.trabajosacademicos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    @NotBlank(message = "The 'email' field cannot be blank")
    @Email(message = "The 'email' field must be a valid email address")
    private String email;
    @NotBlank(message = "The 'password' field cannot be blank")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=])[A-Za-z\\d@#$%^&+=]{8,}$", message = "The 'password' must contain at least one lowercase letter, one uppercase letter, one digit, and one special character from [@#$%^&+=], and have a minimum length of 8 characters.")
    private String password;
}
