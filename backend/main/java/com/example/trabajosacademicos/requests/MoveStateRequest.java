package com.example.trabajosacademicos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MoveStateRequest {
    @NotBlank(message = "The 'stateId1' field cannot be blank")
    private int stateId1;
    @NotBlank(message = "The 'stateId2' field cannot be blank")
    private int stateId2;
    @NotEmpty(message = "The 'stateIds' field cannot be blank")
    private int[] stateIds;

}
