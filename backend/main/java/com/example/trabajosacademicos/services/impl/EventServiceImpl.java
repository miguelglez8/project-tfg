package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.entities.Event;
import com.example.trabajosacademicos.entities.Job;
import com.example.trabajosacademicos.entities.User;
import com.example.trabajosacademicos.exception.EventNotFoundException;
import com.example.trabajosacademicos.exception.JobNotFoundException;
import com.example.trabajosacademicos.exception.ResourceNotFoundException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.mappers.EventMapper;
import com.example.trabajosacademicos.repositories.EventRepository;
import com.example.trabajosacademicos.repositories.JobRepository;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.services.EventService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Override
    public void addEvent(EventDTO request) {
        List<User> users = new ArrayList<>();

        for (int i = 0; i < request.getAssignedTo().length; i++) {
            User user = userRepository.findByEmail(request.getAssignedTo()[i]);
            users.add(user);
        }

        Job job = jobRepository.findByTitle(request.getAssociatedAcademicWork());

        LocalDateTime init = request.getDeadlineDateTimeInit();
        LocalDateTime fin = request.getDeadlineDateTimeFin();

        if (fin.isBefore(init) && !fin.equals(init)) {
            throw new IllegalArgumentException("Final date cannot be before initial date");
        }

        Event event = Event.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .deadlineDateTimeInit(request.getDeadlineDateTimeInit())
                .deadlineDateTimeFin(request.getDeadlineDateTimeFin())
                .job(job)
                .attachedResources(request.getAttachedResources())
                .allDay(request.isAllDay())
                .location(request.getLocation())
                .build();

        users.forEach(user -> user.getEvents().add(event));
        event.setUsers(new ArrayList<>());
        event.getUsers().addAll(users);
        job.setEvents(new ArrayList<>());
        job.getEvents().add(event);

        jobRepository.save(job);
        userRepository.saveAll(users);
        eventRepository.save(event);
    }
    @Override
    public EventDTO updateEvent(Long id, EventDTO updatedEvent) {
        Event event = eventRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Event is not exist with id: " + id)
        );

        LocalDateTime init = updatedEvent.getDeadlineDateTimeInit();
        LocalDateTime fin = updatedEvent.getDeadlineDateTimeFin();

        if (fin != null && fin.isBefore(init) && !fin.equals(init)) {
            throw new IllegalArgumentException("Final date cannot be before or equal to initial date");
        }

        event.setName(updatedEvent.getName());
        event.setSubject(updatedEvent.getSubject());
        event.setDeadlineDateTimeInit(updatedEvent.getDeadlineDateTimeInit());
        event.setDeadlineDateTimeFin(updatedEvent.getDeadlineDateTimeFin());
        event.setAllDay(updatedEvent.isAllDay());
        event.setLocation(updatedEvent.getLocation());

        return EventMapper.mapToEventDTO(eventRepository.save(event));
    }

    @Override
    public List<EventDTO> getEventsByAssignedTo(String assignedTo) {
        User user = userRepository.findByEmail(assignedTo);

        if (user != null) {
            return user.getEvents().stream().map(
                            element -> EventMapper.mapToEventDTO(element))
                    .collect(Collectors.toList());
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public EventDTO getEventById(Long id) {
        Optional<Event> event = eventRepository.findById(id);

        if (event.isEmpty()) {
            throw new EventNotFoundException("Event not found");
        }

        return EventMapper.mapToEventDTO(event.get());
    }

    public void deleteEvents(List<EventDTO> events) {
        for (EventDTO event : events) {
            this.deleteEvent(event.getId());
        }
    }

    @Override
    public void deleteEventsByJobTitle(String title) {
        Job job = jobRepository.findByTitle(title);

        if (job != null) {
            this.deleteEvents(job.getEvents().stream().map(
                            element -> EventMapper.mapToEventDTO(element)).
                    collect(Collectors.toList()));
        }
    }

    @Override
    public List<EventDTO> getEventsByJob(String title) {
        Job job = jobRepository.findByTitle(title);

        if (job != null) {
            return job.getEvents().stream().map(
                            element -> EventMapper.mapToEventDTO(element))
                    .collect(Collectors.toList());
        } else {
            throw new JobNotFoundException("Job not found");
        }
    }

    @Override
    public void leaveEvent(Long id, String userEmail) {
        Optional<Event> event = eventRepository.findById(id);
        User user = userRepository.findByEmail(userEmail);

        if (event.isEmpty()) {
            throw new EventNotFoundException("Event not exist");
        }

        user.getEvents().remove(event);
        event.get().getUsers().remove(user);

        userRepository.save(user);
        eventRepository.save(event.get());
    }

    @Override
    public void deleteEventsByJobTitleAndEmail(String title, String email) {
        User user = userRepository.findByEmail(email);
        Job job = jobRepository.findByTitle(title);

        if (job != null) {
            job.getEvents().stream().filter(elem -> elem.getUsers().contains(user)).
                    collect(Collectors.toList()).forEach(elem -> eventRepository.delete(elem));
        }
    }

    @Override
    public void deleteEventsByEmail(String email) {
        User user = userRepository.findByEmail(email);

        if (user != null) {
            this.deleteEvents(user.getEvents().stream().map(
                            element -> EventMapper.mapToEventDTO(element)).
                    collect(Collectors.toList()));
        }
    }

    @Override
    public void deleteEvent(Long id) {
        Optional<Event> event = eventRepository.findById(id);

        if (event.isEmpty()) {
            throw new EventNotFoundException("Event not exist");
        }

        eventRepository.deleteById(id);
    }

}
