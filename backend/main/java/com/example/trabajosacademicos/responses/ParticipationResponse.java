package com.example.trabajosacademicos.responses;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParticipationResponse {
    private String user;
    private int contribution;
}
