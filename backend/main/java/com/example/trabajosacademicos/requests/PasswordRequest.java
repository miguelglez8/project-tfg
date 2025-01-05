package com.example.trabajosacademicos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordRequest {
    @NotBlank(message = "The 'password' field cannot be blank")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=])[A-Za-z\\d@#$%^&+=]{8,}$", message = "The 'password' must contain at least one lowercase letter, one uppercase letter, one digit, and one special character from [@#$%^&+=], and have a minimum length of 8 characters.")
    private String password;
}
