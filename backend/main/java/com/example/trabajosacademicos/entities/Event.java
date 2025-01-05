package com.example.trabajosacademicos.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "The 'name' field cannot be blank")
    @Length(max = 255, message = "The 'name' field cannot have more than 255 characters")
    private String name;
    @Length(max = 255, message = "The 'subject' field cannot have more than 255 characters")
    private String subject;
    private String attachedResources;
    @DateTimeFormat
    @Future(message = "The 'deadlineDateTimeInit' field must be after the current date")
    private LocalDateTime deadlineDateTimeInit;
    @DateTimeFormat
    @Future(message = "The 'deadlineDateTimeFin' field must be after the current date")
    private LocalDateTime deadlineDateTimeFin;
    @ManyToOne
    private Job job;

    @ManyToMany
    @JoinTable(
            name = "users_events",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users = new ArrayList<>();
    private boolean allDay;
    private String location;
}
