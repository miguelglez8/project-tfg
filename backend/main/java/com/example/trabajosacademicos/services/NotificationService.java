package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.NotificationDTO;

import java.util.List;

public interface NotificationService {
    void markRead(Long notificationId);

    void markHidden(Long notificationId);

    List<NotificationDTO> getHiddenNotifications(String receiver);

    List<NotificationDTO> getNotHiddenNotifications(String receiver);

    List<NotificationDTO> getNotSeenNotifications(String receiver);

    void deleteByUser(String email);

    void push(NotificationDTO notification);

    void deleteBySenderAndReceiver(String sender, String receiver);
    void deleteBySenderAndTitle(String sender, String title);
}
