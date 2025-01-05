package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.jwt.JwtService;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.services.EmailService;
import com.example.trabajosacademicos.requests.EmailRequest;
import com.example.trabajosacademicos.services.UserService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/send-email")
public class EmailController {
    private final EmailService emailService;
    private final UserService userService;
    private final JwtService jwtService;
    @PostMapping
    public ResponseEntity sendEmail(@Valid @RequestBody EmailRequest request) {
        String email = request.getTo();
        UserDTO user = userService.getUserByEmail(email);

        if (user != null) {
            String token = jwtService.getToken(email);

            try {
                emailService.sendEmail(request.getTo(), request.getSubject(), request.getText(), request.isConfirm(), token, email, request.getI18n());
            } catch (MessagingException e) {
                return ResponseEntity.badRequest().build();
            }

            return ResponseEntity.ok("Sent email to user");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

