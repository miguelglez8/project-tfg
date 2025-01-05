package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.entities.TaskStatus;

import java.util.List;

public interface TaskStatusService {
    void addTaskStatus(String status, String email, int id);

    List<TaskStatus> getAllTaskStatus(String email);

    void moveState(int stateId1, int stateId2, int[] stateIds);

    void deleteStatus(Long id);

    void updateStatus(int id, String newStatus);

    void deleteAllTaskStatus(String email);
}
