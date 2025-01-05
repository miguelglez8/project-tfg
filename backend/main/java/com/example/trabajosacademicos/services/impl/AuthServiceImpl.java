package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.entities.User;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.services.AuthService;
import com.example.trabajosacademicos.requests.AuthRequest;
import com.example.trabajosacademicos.responses.AuthResponse;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Override
    public AuthResponse login(AuthRequest request, String token) {
        LocalDateTime now = LocalDateTime.now();

        try {
            logger.info("Succesfull login for user: {} - Date and hour: {}", request.getEmail(), now);

            User userToChange = userRepository.findByEmail(request.getEmail());
            userToChange.setCurrentConnectivity(userToChange.getLastConnectivity());
            userToChange.setToken(token);
            userRepository.save(userToChange);

            return AuthResponse.builder()
                    .token(token)
                    .build();
        } catch (AuthenticationException e) {
            if (e instanceof BadCredentialsException) {
                logger.error("Invalid credentials for user: {} - Date and hour: {}", request.getEmail(), now);
                throw new RuntimeException("Login failed. Please verify your credentials.");
            } else {
                logger.error("Login error for user: {} - Date and hour: {}", request.getEmail(), now, e);
                throw new RuntimeException("Failed to login. Please try again later.");
            }
        }
    }
}
