package com.example.trabajosacademicos.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    @NotBlank(message = "The 'role' field cannot be blank")
    private String role;
    @NotBlank(message = "The 'currentConnectivity' field cannot be blank")
    private String currentConnectivity;
    @NotBlank(message = "The 'lastConnectivity' field cannot be blank")
    private String lastConnectivity;
    @NotBlank(message = "The 'firstName' field cannot be blank")
    @Length(max = 255, message = "The 'firstName' field cannot have more than 255 characters")
    private String firstName;
    @NotBlank(message = "The 'lastName' field cannot be blank")
    @Length(max = 255, message = "The 'lastName' field cannot have more than 255 characters")
    private String lastName;
    @NotBlank(message = "The 'email' field cannot be empty")
    @Email(message = "The 'email' field must be a valid email address")
    private String email;
    @Length(max = 255, message = "The 'place' field cannot have more than 255 characters")
    private String place;
    @Past(message = "The 'birthdate' field must be a past date")
    private LocalDate birthdate;
    @Pattern(regexp = "^(|\\d{9,11})$", message = "The 'phoneNumber' field must be empty or contain between 9 and 11 numbers")
    private int phoneNumber;
    @NotBlank(message = "The 'password' field cannot be blank")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=])[A-Za-z\\d@#$%^&+=]{8,}$", message = "The 'password' must contain at least one lowercase letter, one uppercase letter, one digit, and one special character from [@#$%^&+=], and have a minimum length of 8 characters.")
    private String password;
    private String token;
}
