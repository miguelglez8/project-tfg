package com.example.trabajosacademicos.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaskStatusDTO {
    @NotBlank(message = "The 'id' field cannot be blank")
    private Long id;
    @NotBlank(message = "The 'status' field cannot be blank")
    private String status;
    @NotBlank(message = "The 'email' field cannot be blank")
    @Email(message = "The 'email' field must be a valid email address")
    private String email;

}
