package com.example.trabajosacademicos.mappers;

import com.example.trabajosacademicos.entities.Objective;
import com.example.trabajosacademicos.entities.Task;
import com.example.trabajosacademicos.dtos.TaskDTO;

public class TaskMapper {
    public static TaskDTO mapToTaskDTO(Task task) {
        Objective[] objectivesArray = task.getObjectivesList()
                .stream()
                .map(objective -> {
                    return new Objective(objective.getIsCompleted(), objective.getDescription());
                })
                .toArray(Objective[]::new);

        return new TaskDTO(
                task.getId(),
                task.getName(),
                task.getSubject(),
                task.getAttachedResources(),
                task.getDeadlineDateTime(),
                task.getJob().getTitle(),
                objectivesArray,
                task.getTaskStatus().getId(),
                task.getDifficultyLevel().toString(),
                task.getUsers().stream().map(user -> user.getEmail()).toArray(String[]::new),
                task.getOrderNumber(),
                task.getPercentage()
        );
    }
}
