package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.entities.TaskStatus;
import com.example.trabajosacademicos.entities.User;
import com.example.trabajosacademicos.exception.TaskStatusException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.repositories.TaskStatusRepository;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.services.TaskStatusService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TaskStatusServiceImpl implements TaskStatusService {
    private final TaskStatusRepository taskStatusRepository;
    private final UserRepository userRepository;

    @Override
    public void addTaskStatus(String status, String email, int id) {
        User user = userRepository.findByEmail(email);

        if (user != null) {
            TaskStatus taskStatus = new TaskStatus(status);
            taskStatus.setId(Long.valueOf(id));

            taskStatus.setUser(user);

            user.getTaskStatuses().add(taskStatus);

            taskStatus.setOrderNumber(user.getTaskStatuses().size() > 0 ? user.getTaskStatuses().size() - 1 : 0);

            userRepository.save(user);
            taskStatusRepository.save(taskStatus);
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public List<TaskStatus> getAllTaskStatus(String email) {
        User user = userRepository.findByEmail(email);

        if (user != null) {
            List<TaskStatus> sortedTaskStatuses = user.getTaskStatuses().stream()
                    .sorted(Comparator.comparingInt(TaskStatus::getOrderNumber))
                    .collect(Collectors.toList());

            return sortedTaskStatuses;
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public void deleteStatus(Long id) {
        Optional<TaskStatus> taskStatus = taskStatusRepository.findById(id);

        if (taskStatus.isEmpty()) {
            throw new TaskStatusException("TaskStatus not exist");
        }

        taskStatusRepository.delete(taskStatus.get());
    }

    @Override
    public void updateStatus(int id, String newStatus) {
        Optional<TaskStatus> taskStatusToUpdate = taskStatusRepository.findById(Long.valueOf(id));

        if (taskStatusToUpdate.isEmpty()) {
            throw new TaskStatusException("TaskStatus not exist");
        }

        if (taskStatusToUpdate.isPresent()) {
            TaskStatus taskStatus = taskStatusToUpdate.get();
            taskStatus.setStatus(newStatus);

            taskStatusRepository.save(taskStatus);
        }
    }

    @Override
    public void moveState(int stateId1, int stateId2, int[] stateIds) {
        if (stateIds == null || stateIds.length == 0) {
            throw new IllegalArgumentException("User task status IDs array is null or empty");
        }

        int fromIndex = -1;
        int toIndex = -1;
        for (int i = 0; i < stateIds.length; i++) {
            if (stateIds[i] == stateId1) {
                fromIndex = i;
            } else if (stateIds[i] == stateId2) {
                toIndex = i;
            }
        }

        if (fromIndex == -1 || toIndex == -1) {
            throw new IllegalArgumentException("One or both of the provided TaskStatus IDs do not exist");
        }

        if (fromIndex < toIndex) {
            int temp = stateIds[fromIndex];
            for (int i = fromIndex; i < toIndex; i++) {
                stateIds[i] = stateIds[i + 1];
            }
            stateIds[toIndex] = temp;
        } else {
            int temp = stateIds[fromIndex];
            for (int i = fromIndex; i > toIndex; i--) {
                stateIds[i] = stateIds[i - 1];
            }
            stateIds[toIndex] = temp;
        }

        for (int i = 0; i < stateIds.length; i++) {
            int taskStatusId = stateIds[i];
            TaskStatus status = taskStatusRepository.findById(Long.valueOf(taskStatusId)).get();
            status.setOrderNumber(i);
            taskStatusRepository.save(status);
        }
    }

    @Override
    public void deleteAllTaskStatus(String email) {
        User user = userRepository.findByEmail(email);

        if (user != null) {
            List<TaskStatus> taskStatuses = user.getTaskStatuses();
            taskStatusRepository.deleteAll(taskStatuses);
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

}