package com.example.trabajosacademicos.mappers;

import com.example.trabajosacademicos.entities.Notification;
import com.example.trabajosacademicos.dtos.NotificationDTO;

public class NotificationMapper {
    public static NotificationDTO mapToNotificationDTO(Notification notification) {
        return new NotificationDTO(
                Math.toIntExact(notification.getId()),
                notification.getType().toString(),
                notification.getUserNotif().getEmail(),
                notification.getSender(),
                notification.isSeen(),
                notification.isHidden(),
                notification.getDate(),
                notification.getTitleTeam()
        );
    }
}
