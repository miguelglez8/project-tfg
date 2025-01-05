package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.NotificationDTO;
import com.example.trabajosacademicos.exception.NotificationNotFoundException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.services.NotificationService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    @PostMapping("/push")
    public ResponseEntity sendNotification(@Valid @RequestBody NotificationDTO notification) {
        notificationService.push(notification);

        return ResponseEntity.ok("Notification saved successfully");
    }

    @GetMapping("/{receiver}/hidden")
    public ResponseEntity<List<NotificationDTO>> getHiddenNotifications(@PathVariable String receiver) {
        try {
            List<NotificationDTO> notifications = notificationService.getHiddenNotifications(receiver);
            return ResponseEntity.ok(notifications);
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{receiver}/notHidden")
    public ResponseEntity<List<NotificationDTO>> getNotHiddenNotifications(@PathVariable String receiver) {
        try {
            List<NotificationDTO> notifications = notificationService.getNotHiddenNotifications(receiver);
            return ResponseEntity.ok(notifications);
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{receiver}/notSeen")
    public ResponseEntity<List<NotificationDTO>> getNotSeenNotifications(@PathVariable String receiver) {
        try {
            List<NotificationDTO> notifications = notificationService.getNotSeenNotifications(receiver);
            return ResponseEntity.ok(notifications);
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{notificationId}/markRead")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markRead(notificationId);
            return ResponseEntity.ok().build();
        } catch (NotificationNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{notificationId}/markHidden")
    public ResponseEntity<Void> markNotificationAsHidden(@PathVariable Long notificationId) {
        try {
            notificationService.markHidden(notificationId);
            return ResponseEntity.ok().build();
        } catch (NotificationNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/deleteNotification")
    public ResponseEntity<Void> deleteBySenderAndReceiver(@RequestParam String sender, @RequestParam String receiver) {
        try {
            notificationService.deleteBySenderAndReceiver(sender, receiver);
            return ResponseEntity.ok().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("{title}/deleteNotification")
    public ResponseEntity<Void> deleteBySenderAndTitle(@PathVariable String title, @RequestParam String sender) {
        try {
            notificationService.deleteBySenderAndTitle(sender, title);
            return ResponseEntity.ok().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
