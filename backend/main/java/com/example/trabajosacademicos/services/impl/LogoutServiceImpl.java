package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.entities.Connectivity;
import com.example.trabajosacademicos.entities.User;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.services.LogoutService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class LogoutServiceImpl implements LogoutService {
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(LogoutServiceImpl.class);

    @Override
    public void logout(String email) {
        LocalDateTime now = LocalDateTime.now();

        User userToChange = userRepository.findByEmail(email);
        if (userToChange != null) {
            userToChange.setCurrentConnectivity(Connectivity.OFFLINE);
            userToChange.setToken("");
            userRepository.save(userToChange);
        } else {
            throw new RuntimeException("Logout failed. Please verify your credentials.");
        }

        logger.info("Succesfull logout for user {} - Date and hour: {}", email, now);
    }
}
