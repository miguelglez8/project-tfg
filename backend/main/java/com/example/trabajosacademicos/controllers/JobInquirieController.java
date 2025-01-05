package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.JobInquirieDTO;
import com.example.trabajosacademicos.exception.JobException;
import com.example.trabajosacademicos.exception.JobNotFoundException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.services.JobInquirieService;
import com.example.trabajosacademicos.services.JobService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/jobinquiries")
public class JobInquirieController {
    private final JobInquirieService jobInquirieService;
    private final JobService jobService;

    @PostMapping("/job-inquiries")
    public ResponseEntity addJobInquirie(@Valid @RequestBody JobInquirieDTO jobInquirieDTO) {
        try {
            jobInquirieService.addJobInquirie(jobInquirieDTO);
            return ResponseEntity.ok("JobInquiries request sent successfully");
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (JobNotFoundException | UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send jobInquiries request");
        }
    }

    @GetMapping("/received")
    public ResponseEntity<List<JobInquirieDTO>> getReceivedJobInquiriesRequests(@RequestParam String title, @RequestParam String user) {
        boolean isAdmin = jobService.isAdmin(title, user);

        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            List<JobInquirieDTO> receivedRequests = jobInquirieService.getReceivedJobInquiriesRequests(title);
            return ResponseEntity.ok(receivedRequests);
        } catch (JobNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/accept")
    public ResponseEntity acceptJobInquiriesRequest(@RequestParam String requestEmail, @RequestParam String title, @RequestParam String user) {
        try {
            jobInquirieService.cancelJobInquiriesRequest(requestEmail, title);
            jobService.addMemberToTeam(title, requestEmail, user);
            return ResponseEntity.ok("JobInquiries request accepted successfully");
        } catch (JobException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (JobNotFoundException | UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to accept jobInquiries request");
        }
    }

    @DeleteMapping("/cancel")
    public ResponseEntity cancelJobInquiriesRequest(@RequestParam String requestEmail, @RequestParam String title) {
        try {
            jobInquirieService.cancelJobInquiriesRequest(requestEmail, title);
            return ResponseEntity.ok("JobInquiries request canceled successfully");
        } catch (JobNotFoundException | UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to cancel jobInquiries request");
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity deleteJobInquiriesRequest(@RequestParam String requestEmail, @RequestParam String title, @RequestParam String user) {
        try {
            boolean isAdmin = jobService.isAdmin(title, user);

            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            jobInquirieService.cancelJobInquiriesRequest(requestEmail, title);
            return ResponseEntity.ok("JobInquiries request deleted successfully");
        }  catch (JobNotFoundException | UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to cancel jobInquiries request");
        }
    }

    @GetMapping("/sent")
    public ResponseEntity<List<JobInquirieDTO>> getSentJobInquiriesRequest(@RequestParam String senderEmail) {
        try {
            List<JobInquirieDTO> sentRequests = jobInquirieService.getSentJobInquiriesRequest(senderEmail);
            return ResponseEntity.ok(sentRequests);
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
