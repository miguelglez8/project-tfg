package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.TaskDTO;

import java.util.List;

public interface TaskService {
    void addTask(TaskDTO request);

    void deleteTasks(List<TaskDTO> tasks);

    List<TaskDTO> getTaskByStatusId(Long valueOf);

    void deleteTask(Long task);

    TaskDTO updateTask(Long id, TaskDTO updatedTask);

    List<TaskDTO> getTasksByAssignedTo(String assignedTo);

    TaskDTO getTaskById(Long id);

    void moveState(int taskId1, int taskId2, int[] taskIds);

    void move(int stateId1, int state2);

    void deleteTasksByJobTitle(String title);

    List<TaskDTO> getTasksByJob(String title);

    void deleteTasksByJobTitleAndEmail(String title, String email);

    void deleteTasksByEmail(String email);
}
