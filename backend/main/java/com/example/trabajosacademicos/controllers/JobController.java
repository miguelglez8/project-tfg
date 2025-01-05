package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.JobUserRelationDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.entities.Role;
import com.example.trabajosacademicos.exception.JobException;
import com.example.trabajosacademicos.exception.JobNotFoundException;
import com.example.trabajosacademicos.exception.ResourceNotFoundException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.services.*;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobService;
    private final JobInquirieService jobInquirieService;
    private final TaskService taskService;
    private final EventService eventService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity register(@Valid @RequestBody JobDTO request) {
        try {
            UserDTO user = userService.getUserByEmail(request.getCreator());
            if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not exist");
            if (user.getRole().equals(Role.STUDENT.toString())) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only for teachers");
            jobService.registerJob(request);
            return ResponseEntity.ok("Job saved successfully");
        } catch (JobException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send friendship request");
        }
    }

    @GetMapping("/{userEmail}/job-relations")
    public ResponseEntity<List<JobUserRelationDTO>> getJobs(@PathVariable String userEmail) {
        UserDTO user = userService.getUserByEmail(userEmail);

        if (user != null) {
            return ResponseEntity.ok(jobService.getJobs(userEmail));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{title}/job")
    public ResponseEntity<JobDTO> getJobByTitle(@PathVariable String title) {
        JobDTO job = jobService.getJobByTitle(title);

        if (job != null) {
            return ResponseEntity.ok(job);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{relationId}/visibility")
    public ResponseEntity updateVisibility(@PathVariable Long relationId) {
        try {
            jobService.updateVisibility(relationId);
            return ResponseEntity.ok("Job visibility updated");
        } catch (JobNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send friendship request");
        }
    }

    @PostMapping("/members")
    public ResponseEntity addMemberToTeam(@RequestParam String jobTitle, @RequestParam String userEmail, @RequestParam String user) {
        try {
            jobService.addMemberToTeam(jobTitle, userEmail, user);
            jobInquirieService.cancelJobInquiriesRequest(userEmail, jobTitle);
            return ResponseEntity.ok("Member added successfully");
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (UserNotFoundException | JobNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get member");
        }
    }

    @GetMapping("/isMember")
    public ResponseEntity isMember(@RequestParam String jobTitle, @RequestParam String userEmail) {
        try {
            return ResponseEntity.ok(jobService.isMember(jobTitle, userEmail));
        } catch (JobNotFoundException | UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get if is member");
        }
    }

    @GetMapping("/members")
    public ResponseEntity getMembers(@RequestParam String jobTitle, @RequestParam String user) {
        try {
            List<UserDTO> list = jobService.getMembers(jobTitle, user);
            return ResponseEntity.ok(list);
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (JobNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get members");
        }
    }

    @GetMapping("/isAdmin")
    public ResponseEntity isAdmin(@RequestParam String jobTitle, @RequestParam String userEmail) {
        try {
            return ResponseEntity.ok(jobService.isAdmin(jobTitle, userEmail));
        } catch (JobNotFoundException | UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get if is admin");
        }
    }

    @PutMapping("{id}")
    public ResponseEntity updateJob(@PathVariable Long id, @Valid @RequestBody JobDTO updatedJob, @RequestParam String user) {
        try {
            return ResponseEntity.ok(jobService.updateJob(id, updatedJob, user));
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update job");
        }
    }

    @PutMapping("{title}/permissions")
    public ResponseEntity changePermissions(@PathVariable String title, @RequestParam String email, @RequestParam String user) {
        try {
            UserDTO rol = userService.getUserByEmail(email);
            JobDTO job = jobService.getJobByTitle(title);

            jobService.changePermissions(job.getId(), email, user, rol.getRole());
            return ResponseEntity.ok("Permission changed for user with email: " + email);
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (JobNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to change permissions");
        }
    }

    @DeleteMapping("{title}/exitTeam")
    public ResponseEntity<String> exitTeam(@PathVariable String title, @RequestParam String email) {
        try {
            jobService.deleteMember(title, email, email);
            taskService.deleteTasksByJobTitleAndEmail(title, email);
            eventService.deleteEventsByJobTitleAndEmail(title, email);

            return ResponseEntity.ok("Member exit successfully");
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (JobNotFoundException | UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to exit team");
        }
    }

    @DeleteMapping("{title}/deleteTeam")
    public ResponseEntity<String> deleteTeam(@PathVariable("title") String title, @RequestParam String user) {
        try {
            JobDTO job = jobService.getJobByTitle(title);

            Long id = job.getId();

            boolean isCreator = jobService.isCreator(title, user);

            if (!isCreator) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            jobService.deleteJobRelationsById(id);

            jobInquirieService.deleteInquiriesById(id);

            taskService.deleteTasksByJobTitle(title);

            eventService.deleteEventsByJobTitle(title);

            jobService.deleteJobById(id);

            return ResponseEntity.ok("Team deleted successfully");
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (JobNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete team");
        }
    }

    @DeleteMapping("{title}/deleteMember")
    public ResponseEntity<String> deleteMember(@PathVariable("title") String title, @RequestParam String email, @RequestParam String user)  {
        try {
            boolean isAdmin = jobService.isAdmin(title, user);

            if (!isAdmin || email.equals(user)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            boolean admin = jobService.isAdmin(title, email);

            if (admin) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            jobService.deleteMember(title, email, user);
            taskService.deleteTasksByJobTitleAndEmail(title, email);
            eventService.deleteEventsByJobTitleAndEmail(title, email);

            return ResponseEntity.ok("Member deleted successfully");
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (JobNotFoundException | UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete member");
        }
    }

}
