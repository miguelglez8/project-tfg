package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.requests.AuthRequest;
import com.example.trabajosacademicos.responses.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request, String token);
}
