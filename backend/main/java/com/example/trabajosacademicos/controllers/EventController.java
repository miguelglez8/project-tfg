package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.exception.EventNotFoundException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.services.EventService;
import com.example.trabajosacademicos.services.JobService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;
    private final JobService jobService;

    @PostMapping
    public ResponseEntity register(@Valid @RequestBody EventDTO eventDTO) {
        for (int i = 0; i < eventDTO.getAssignedTo().length; i++) {
            boolean response = jobService.isMember(eventDTO.getAssociatedAcademicWork(), eventDTO.getAssignedTo()[i]);
            if (!response) {
                return ResponseEntity.badRequest().build();
            }
        }

        try {
            eventService.addEvent(eventDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete member");
        }

        return ResponseEntity.ok("Event saved successfully");
    }

    @GetMapping("{assignedTo}")
    public ResponseEntity getEventsByAssignedTo(@PathVariable("assignedTo") String assignedTo) {
        try {
            List<EventDTO> events = eventService.getEventsByAssignedTo(assignedTo);

            return ResponseEntity.ok(events);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to get events");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete member");
        }
    }

    @GetMapping("{job}/job")
    public ResponseEntity<List<EventDTO>> getEventsByJob(@PathVariable("job") String job, @RequestParam String user) {
        if (jobService.isMember(job, user)) {
            List<EventDTO> events = eventService.getEventsByJob(job);
            return ResponseEntity.ok(events);
        }

        return ResponseEntity.badRequest().build();
    }

    @GetMapping("{id}/id")
    public ResponseEntity getEventById(@PathVariable("id") Long id) {
        try {
            EventDTO events = eventService.getEventById(id);

            return ResponseEntity.ok(events);
        } catch (EventNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to get event");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete member");
        }
    }

    @DeleteMapping("{id}/id")
    public ResponseEntity<String> deleteEventById(@PathVariable("id") Long id, @RequestParam String user) {
        EventDTO event = eventService.getEventById(id);

        if (event != null && jobService.isMember(event.getAssociatedAcademicWork(), user) == true) {
            if (user.equals(event.getAssignedTo()[0]))
                eventService.deleteEvent(id);
            else
                eventService.leaveEvent(id, user);

            return ResponseEntity.ok("Deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDTO updatedEvent, @RequestParam String user) {
        EventDTO event = eventService.getEventById(id);

        if (event != null && jobService.isMember(event.getAssociatedAcademicWork(), user) == true
                && new ArrayList<>(Arrays.asList(event.getAssignedTo())).contains(user)) {
            try {
                return ResponseEntity.ok(eventService.updateEvent(id, updatedEvent));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            } catch (Exception e) {
                return ResponseEntity.internalServerError().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
