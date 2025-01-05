package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.CallDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.services.CallService;
import com.example.trabajosacademicos.services.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/calls")
public class CallController {
    private final CallService callService;
    private final UserService userService;

    @GetMapping("{assignedTo}")
    public ResponseEntity<List<CallDTO>> getCalls(@PathVariable("assignedTo") String assignedTo) {
        UserDTO user = userService.getUserByEmail(assignedTo);

        if (user != null) {
            List<CallDTO> tasks = callService.getCallsByUser(assignedTo);

            return ResponseEntity.ok(tasks);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity register(@Valid @RequestBody CallDTO request) {
        UserDTO userCalled = userService.getUserByEmail(request.getUserCalled());
        UserDTO userCall = userService.getUserByEmail(request.getUserCall());

        if (userCalled != null && userCall != null) {
            callService.addCall(request);

            return ResponseEntity.ok("Call saved successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
