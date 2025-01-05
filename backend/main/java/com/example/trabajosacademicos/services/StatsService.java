package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.responses.StatsResponse;

import java.util.List;

public interface StatsService {
    StatsResponse getStats(List<TaskDTO> tasks, List<EventDTO> events, List<JobDTO> jobs);
}
