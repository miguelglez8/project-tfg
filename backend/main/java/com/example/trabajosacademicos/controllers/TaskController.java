package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.exception.TaskNotFoundException;
import com.example.trabajosacademicos.exception.TaskStatusException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.requests.MoveStateRequest;
import com.example.trabajosacademicos.services.JobService;
import com.example.trabajosacademicos.services.TaskService;
import com.example.trabajosacademicos.services.TaskStatusService;
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
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;
    private final TaskStatusService taskStatusService;
    private final JobService jobService;

    @PostMapping
    public ResponseEntity register(@Valid @RequestBody TaskDTO request) {
        boolean response = jobService.isMember(request.getAssociatedAcademicWork(), request.getAssignedTo()[0]);

        if (!response) {
            return ResponseEntity.badRequest().build();
        }

        taskService.addTask(request);

        return ResponseEntity.ok("Task saved successfully");
    }

    @GetMapping("{assignedTo}")
    public ResponseEntity getTasksByAssignedTo(@PathVariable("assignedTo") String assignedTo) {
        try {
            List<TaskDTO> tasks = taskService.getTasksByAssignedTo(assignedTo);

            return ResponseEntity.ok(tasks);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to get tasks");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("{job}/job")
    public ResponseEntity<List<TaskDTO>> getTasksByJob(@PathVariable("job") String job, @RequestParam String user) {
        if (jobService.isMember(job, user)) {
            List<TaskDTO> tasks = taskService.getTasksByJob(job);
            return ResponseEntity.ok(tasks);
        }

        return ResponseEntity.badRequest().build();
    }

    @GetMapping("{id}/id")
    public ResponseEntity getTaskById(@PathVariable("id") Long id) {
        try {
            TaskDTO tasks = taskService.getTaskById(id);

            return ResponseEntity.ok(tasks);
        } catch (TaskNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to get task");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteTasksByStatus(@PathVariable("id") int id) {
        try {
            List<TaskDTO> tasks = taskService.getTaskByStatusId(Long.valueOf(id));

            if (tasks != null) taskService.deleteTasks(tasks);
            taskStatusService.deleteStatus(Long.valueOf(id));

            return ResponseEntity.ok("Deleted successfully");
        } catch (TaskStatusException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to delete by task status");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("{id}/{status}")
    public ResponseEntity<String> updateTasksByStatus(@PathVariable("id") int id, @PathVariable("status") String newStatus) {
        try {
            taskStatusService.updateStatus(id, newStatus);

            return ResponseEntity.ok("Updated successfully");
        } catch (TaskStatusException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to update by task status");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("{id}/id")
    public ResponseEntity<String> deleteTaskById(@PathVariable("id") Long id, @RequestParam String user) {
        TaskDTO task = taskService.getTaskById(id);

        if (task != null && jobService.isMember(task.getAssociatedAcademicWork(), user) == true && user.equals(task.getAssignedTo()[0])) {
            taskService.deleteTask(id);

            return ResponseEntity.ok("Deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDTO updatedTask, @RequestParam String user) {
        TaskDTO task = taskService.getTaskById(id);

        if (task != null && jobService.isMember(task.getAssociatedAcademicWork(), user) == true
                && new ArrayList<>(Arrays.asList(task.getAssignedTo())).contains(user)) {
            return ResponseEntity.ok(taskService.updateTask(id, updatedTask));
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/move-state")
    public ResponseEntity<String> moveState(@Valid @RequestBody MoveStateRequest moveStateRequest) {
        int stateTitle1 = moveStateRequest.getStateId1();
        int stateTitle2 = moveStateRequest.getStateId2();
        int[] states = moveStateRequest.getStateIds();

        try {
            taskService.moveState(stateTitle1, stateTitle2, states);
            return ResponseEntity.ok("Tasks moved successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/move")
    public ResponseEntity<String> move(@Valid @RequestBody MoveStateRequest moveStateRequest) {
        int stateTitle1 = moveStateRequest.getStateId1();
        int stateTitle2 = moveStateRequest.getStateId2();

        try {
            taskService.move(stateTitle1, stateTitle2);
            return ResponseEntity.ok("Tasks moved successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
