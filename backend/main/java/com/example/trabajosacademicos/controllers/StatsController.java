package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.JobUserRelationDTO;
import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.responses.StatsResponse;
import com.example.trabajosacademicos.services.EventService;
import com.example.trabajosacademicos.services.JobService;
import com.example.trabajosacademicos.services.StatsService;
import com.example.trabajosacademicos.services.TaskService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/stats")
public class StatsController {
    private final TaskService taskService;
    private final EventService eventService;
    private final JobService jobService;
    private final StatsService statsService;
    @GetMapping("{assignedTo}")
    public ResponseEntity<StatsResponse> getStats(@PathVariable("assignedTo") String assignedTo) {
        try {
            List<TaskDTO> tasks = taskService.getTasksByAssignedTo(assignedTo);
            List<EventDTO> events = eventService.getEventsByAssignedTo(assignedTo);
            List<JobUserRelationDTO> jobUserRelations = jobService.getJobs(assignedTo);
            List<JobDTO> jobs = new ArrayList<>();
            jobUserRelations.forEach(elem -> jobs.add(jobService.getJobByTitle(elem.getName())));

            return ResponseEntity.ok(statsService.getStats(tasks, events, jobs));
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
