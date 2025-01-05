package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.responses.ControlResponse;
import com.example.trabajosacademicos.responses.ParticipationResponse;

import java.util.List;

public interface InformService {
    List<ParticipationResponse> getParticipation(List<TaskDTO> tasks, List<EventDTO> events, List<UserDTO> jobUserRelations);

    List<ControlResponse> getWeeklyControl(List<TaskDTO> tasks, List<EventDTO> events);

    List<ControlResponse> getMonthlyControl(List<TaskDTO> tasks, List<EventDTO> events);
}
