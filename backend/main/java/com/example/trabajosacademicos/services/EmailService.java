package com.example.trabajosacademicos.services;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendEmail(String to, String subject, String text, boolean confirm, String token, String email, String i18n) throws MessagingException;
}

