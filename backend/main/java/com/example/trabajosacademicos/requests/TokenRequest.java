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
public class TokenRequest {
    @NotBlank(message = "The 'appId' field cannot be blank")
    private int appId;
    @NotBlank(message = "The 'userId' field cannot be blank")
    private String userId;
    @NotBlank(message = "The 'secret' field cannot be blank")
    private String secret;
    @NotBlank(message = "The 'effectiveTimeInSeconds' field cannot be blank")
    private int effectiveTimeInSeconds;
    @NotBlank(message = "The 'payload' field cannot be blank")
    private String payload;

}
