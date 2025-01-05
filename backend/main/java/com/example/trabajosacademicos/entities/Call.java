package com.example.trabajosacademicos.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
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
@Table(name = "calls")
public class Call {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "The 'firstName' field cannot be blank")
    private String firstName;
    @NotBlank(message = "The 'lastName' field cannot be blank")
    private String lastName;
    @NotBlank(message = "The 'userCall' field cannot be empty")
    @Email(message = "The 'userCall' field must be a valid email address")
    private String userCall;
    @Enumerated(EnumType.STRING)
    private CallType type;
    @NotBlank(message = "The 'duration' field cannot be blank")
    private String duration;
    @DateTimeFormat
    private LocalDateTime date;
    @Enumerated(EnumType.STRING)
    private ModeCallType callType;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User userCalled;
}
