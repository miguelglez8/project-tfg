package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.EventDTO;

import java.util.List;

public interface EventService {
    void addEvent(EventDTO request);

    void deleteEvent(Long event);

    EventDTO updateEvent(Long id, EventDTO updatedEvent);

    List<EventDTO> getEventsByAssignedTo(String assignedTo);

    EventDTO getEventById(Long id);

    void deleteEventsByJobTitle(String title);

    List<EventDTO> getEventsByJob(String title);

    void leaveEvent(Long id, String userEmail);

    void deleteEventsByJobTitleAndEmail(String title, String email);

    void deleteEventsByEmail(String email);
}
