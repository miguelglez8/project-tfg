package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.requests.MoveStateRequest;
import com.example.trabajosacademicos.dtos.TaskStatusDTO;
import com.example.trabajosacademicos.services.TaskStatusService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/taskStatus")
public class TaskStatusController {
    private final TaskStatusService taskStatusService;

    @PostMapping("/task-status")
    public ResponseEntity<String> addStatus(@Valid @RequestBody TaskStatusDTO state) {
        try {
            taskStatusService.addTaskStatus(state.getStatus(), state.getEmail(), state.getId().intValue());
            return ResponseEntity.status(HttpStatus.OK).body("Status saved successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to add status");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/task-status")
    public ResponseEntity getAllStatuses(@RequestParam String email) {
        try {
            List<TaskStatusDTO> statuses = taskStatusService.getAllTaskStatus(email).stream().
                    map(taskStatus -> new TaskStatusDTO(taskStatus.getId(), taskStatus.getStatus(), taskStatus.getUser().getEmail())).
                    collect(Collectors.toList());
            return ResponseEntity.ok(statuses);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to get all statuses");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/move-state")
    public ResponseEntity<String> moveState(@Valid @RequestBody MoveStateRequest moveStateRequest) {
        int stateTitle1 = moveStateRequest.getStateId1();
        int stateTitle2 = moveStateRequest.getStateId2();
        int[] states = moveStateRequest.getStateIds();

        try {
            taskStatusService.moveState(stateTitle1, stateTitle2, states);
            return ResponseEntity.ok("States moved successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
