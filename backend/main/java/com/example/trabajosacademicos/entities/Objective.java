package com.example.trabajosacademicos.entities;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class Objective {
    @Pattern(regexp = "^[01]$", message = "The 'isCompleted' field must be either 0 or 1")
    private int isCompleted;
    @NotBlank(message = "The 'description' field cannot be blank")
    private String description;
}
