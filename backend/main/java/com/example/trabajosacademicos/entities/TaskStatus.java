package com.example.trabajosacademicos.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "status")
public class TaskStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @NotBlank(message = "The 'status' field cannot be blank")
    private String status;
    @OneToMany(mappedBy = "taskStatus", cascade = CascadeType.ALL)
    private List<Task> tasks = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public TaskStatus(String status) {
        this.status = status;
    }

    private Integer orderNumber;
}
