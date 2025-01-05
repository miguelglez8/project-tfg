package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.FriendshipDTO;
import com.example.trabajosacademicos.exception.FriendshipException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.services.FriendshipService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/friendships")
public class FriendshipController {
    private final FriendshipService friendshipService;

    @PostMapping("/send")
    public ResponseEntity sendFriendshipRequest(@Valid @RequestBody FriendshipDTO friendshipDTO) {
        try {
            friendshipService.sendFriendshipRequest(friendshipDTO);
            return ResponseEntity.ok("Friendship request sent successfully");
        } catch (FriendshipException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send friendship request");
        }
    }

    @GetMapping("/received")
    public ResponseEntity getReceivedFriendshipRequests(@RequestParam String receiverEmail) {
        try {
            List<FriendshipDTO> receivedRequests = friendshipService.getReceivedFriendshipRequests(receiverEmail);
            return ResponseEntity.ok(receivedRequests);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete member");
        }
    }

    @PostMapping("/accept")
    public ResponseEntity acceptFriendshipRequest(@RequestParam String requestEmail, @RequestParam String receiverEmail) {
        try {
            friendshipService.acceptFriendshipRequest(requestEmail, receiverEmail);
            return ResponseEntity.ok("Friendship request accepted successfully");
        } catch (FriendshipException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to accept friendship request");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete member");
        }
    }

    @DeleteMapping("/cancel")
    public ResponseEntity cancelFriendshipRequest(@RequestParam String requestEmail, @RequestParam String receiverEmail) {
        try {
            friendshipService.cancelFriendshipRequest(requestEmail, receiverEmail);
            return ResponseEntity.ok("Friendship request canceled successfully");
        } catch (FriendshipException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to cancel friendship request");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete member");
        }
    }

    @GetMapping("/sent")
    public ResponseEntity getSentFriendshipRequests(@RequestParam String senderEmail) {
        try {
            List<FriendshipDTO> sentRequests = friendshipService.getSentFriendshipRequests(senderEmail);
            return ResponseEntity.ok(sentRequests);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete member");
        }
    }

}

