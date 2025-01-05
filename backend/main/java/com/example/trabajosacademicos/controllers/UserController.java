package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.requests.PasswordRequest;
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
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final FriendshipService friendshipService;
    private final TaskStatusService taskStatusService;
    private final TaskService taskService;
    private final EventService eventService;
    private final NotificationService notificationService;
    private final CallService callService;
    private final JobService jobService;
    private final JobInquirieService jobInquirieService;

    @PostMapping
    public ResponseEntity<String> register(@Valid @RequestBody UserDTO request) {
        if (userService.getUserByEmail(request.getEmail()) != null) return ResponseEntity.badRequest().build();
        userService.register(request);
        return ResponseEntity.ok("User registered!");
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();

        return ResponseEntity.ok(users);
    }

    @DeleteMapping("{email}")
    public ResponseEntity<String> deleteUser(@PathVariable("email") String email) {
        UserDTO user = userService.getUserByEmail(email);

        if (user != null) {
            friendshipService.deleteAllFriendship(user.getId());

            callService.deleteByUser(email);

            notificationService.deleteByUser(email);

            userService.removeAllFriends(email);

            taskStatusService.deleteAllTaskStatus(email);

            taskService.deleteTasksByEmail(email);

            eventService.deleteEventsByEmail(email);

            jobService.deleteMemberByEmail(email);

            jobInquirieService.deleteInquiriesByEmail(email);

            userService.deleteUser(user.getId());

            return ResponseEntity.ok("Deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable("email") String email) {
        UserDTO user = userService.getUserByEmail(email);

        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("{email}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String email, @Valid @RequestBody UserDTO updatedUser) {
        UserDTO user = userService.getUserByEmail(email);

        if (user != null) {
            return ResponseEntity.ok(userService.updateUser(user.getId(), updatedUser));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("{email}/password")
    public ResponseEntity<UserDTO> updatePassword(@PathVariable("email") String email, @Valid @RequestBody PasswordRequest request) {
        UserDTO user = userService.getUserByEmail(email);

        if (user != null) {
            return ResponseEntity.ok(userService.updatePassword(email, request.getPassword()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("{email}/check-password")
    public ResponseEntity<Boolean> checkPassword(@PathVariable("email") String email, @Valid @RequestBody PasswordRequest password) {
        UserDTO user = userService.getUserByEmail(email);

        if (user != null) {
            return ResponseEntity.ok(userService.checkPassword(user, password.getPassword()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userEmail}/friends")
    public ResponseEntity getUserFriends(@PathVariable String userEmail) {
        try {
            List<UserDTO> friends = userService.getFriends(userEmail);
            return ResponseEntity.ok().body(friends);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to get friends");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity removeFriend(@RequestParam String userEmail, @RequestParam String deleteEmail) {
        try {
            userService.removeFriend(userEmail, deleteEmail);
            return ResponseEntity.ok("Friend removed successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to remove friend");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
