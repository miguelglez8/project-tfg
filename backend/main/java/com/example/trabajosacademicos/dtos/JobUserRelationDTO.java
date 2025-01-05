package com.example.trabajosacademicos.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JobUserRelationDTO {
    private Long id;
    @NotBlank(message = "The 'job' field cannot be blank")
    private String name;
    @NotBlank(message = "The 'workType' field cannot be blank")
    private String workType;
    @NotBlank(message = "The 'priority' field cannot be blank")
    private String priority;
    private boolean visible;
    @NotBlank(message = "The 'role' field cannot be blank")
    private String role;
}
