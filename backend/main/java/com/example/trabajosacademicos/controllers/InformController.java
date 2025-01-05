package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.exception.JobNotFoundException;
import com.example.trabajosacademicos.responses.ControlResponse;
import com.example.trabajosacademicos.responses.ParticipationResponse;
import com.example.trabajosacademicos.services.EventService;
import com.example.trabajosacademicos.services.InformService;
import com.example.trabajosacademicos.services.JobService;
import com.example.trabajosacademicos.services.TaskService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/informs")
public class InformController {
    private final TaskService taskService;
    private final EventService eventService;
    private final JobService jobService;
    private final InformService informService;
    @GetMapping("{jobTitle}/participation")
    public ResponseEntity<List<ParticipationResponse>> getParticipation(@PathVariable("jobTitle") String jobTitle, @RequestParam String user) {
        try {
            List<TaskDTO> tasks = taskService.getTasksByJob(jobTitle);
            List<EventDTO> events = eventService.getEventsByJob(jobTitle);
            List<UserDTO> jobUserRelations = jobService.getMembers(jobTitle, user);

            return ResponseEntity.ok(informService.getParticipation(tasks, events, jobUserRelations));
        } catch (JobNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("{jobTitle}/controlWeek")
    public ResponseEntity<List<ControlResponse>> getWeeklyControl(@PathVariable("jobTitle") String jobTitle) {
        try {
            List<TaskDTO> tasks = taskService.getTasksByJob(jobTitle);
            List<EventDTO> events = eventService.getEventsByJob(jobTitle);

            return ResponseEntity.ok(informService.getWeeklyControl(tasks, events));
        } catch (JobNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("{jobTitle}/controlMonth")
    public ResponseEntity<List<ControlResponse>> getMonthlyControl(@PathVariable("jobTitle") String jobTitle) {
        try {
            List<TaskDTO> tasks = taskService.getTasksByJob(jobTitle);
            List<EventDTO> events = eventService.getEventsByJob(jobTitle);

            return ResponseEntity.ok(informService.getMonthlyControl(tasks, events));
        } catch (JobNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
