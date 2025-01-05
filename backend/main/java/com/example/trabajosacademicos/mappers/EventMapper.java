package com.example.trabajosacademicos.mappers;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.entities.Event;

public class EventMapper {
    public static EventDTO mapToEventDTO(Event event) {
        return new EventDTO(
                event.getId(),
                event.getName(),
                event.getSubject(),
                event.getAttachedResources(),
                event.getDeadlineDateTimeInit(),
                event.getDeadlineDateTimeFin(),
                event.getJob().getTitle(),
                event.getUsers().stream().map(user -> user.getEmail()).toArray(String[]::new),
                event.isAllDay(),
                event.getLocation()
        );
    }
}
