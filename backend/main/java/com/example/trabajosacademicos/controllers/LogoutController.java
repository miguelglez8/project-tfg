package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.requests.LogoutRequest;
import com.example.trabajosacademicos.services.LogoutService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/logout")
public class LogoutController {
    private final LogoutService logoutService;

    @PostMapping
    public ResponseEntity logout(@RequestBody LogoutRequest logoutRequest) {
        try {
            logoutService.logout(logoutRequest.getEmail());

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}

