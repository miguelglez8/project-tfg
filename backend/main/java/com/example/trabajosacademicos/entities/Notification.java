package com.example.trabajosacademicos.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "The 'type' field cannot be blank")
    private String type;
    @ManyToOne
    @JoinColumn(name = "userNotif_id")
    private User userNotif;
    @NotBlank(message = "The 'sender' field cannot be blank")
    private String sender;
    private boolean seen;
    private boolean hidden;
    @DateTimeFormat
    private LocalDateTime date;
    private String titleTeam;
}

