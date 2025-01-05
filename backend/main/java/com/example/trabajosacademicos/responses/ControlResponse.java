package com.example.trabajosacademicos.responses;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ControlResponse {
    private int events;
    private int tasks;
    private int completedTasks;
}
