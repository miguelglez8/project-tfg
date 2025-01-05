package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    @Value("${cross.origin}")
    private String link;
    private final JavaMailSender emailSender;

    public EmailServiceImpl(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String text, boolean confirm, String token, String email, String i18n) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            String recoverText = i18n.equals("es") ? "Haz click aquí para recuperar tu cuenta" : "Click here to recover your account";
            String resetPasswordLink = "<a href=\"" + link + "/recover-password?token=" + token + "&userEmail=" + email + "\">" + recoverText + "</a>";
            String emailContent = confirm ? "<pre>" + text + "<pre>" : resetPasswordLink + "<pre>" + "\n\n" + text + "</pre>";

            helper.setText(emailContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new MessagingException();
        }
    }
}

