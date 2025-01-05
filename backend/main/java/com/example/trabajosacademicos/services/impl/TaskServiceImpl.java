package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.entities.*;
import com.example.trabajosacademicos.exception.*;
import com.example.trabajosacademicos.mappers.TaskMapper;
import com.example.trabajosacademicos.repositories.JobRepository;
import com.example.trabajosacademicos.repositories.TaskRepository;
import com.example.trabajosacademicos.repositories.TaskStatusRepository;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.services.TaskService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Override
    public void addTask(TaskDTO request) {
        String level = request.getDifficultyLevel().toString();

        DifficultyLevel difficultyLevel = getDifficultyLevel(level);

        User user = userRepository.findByEmail(request.getAssignedTo()[0]);

        Optional<TaskStatus> status = taskStatusRepository.findById(request.getTaskStatus());
        Job job = jobRepository.findByTitle(request.getAssociatedAcademicWork());

        List<Objective> objectives = new ArrayList<>();
        for (Objective objective : request.getObjectivesList()) {
            Objective newObjective = new Objective(objective.getIsCompleted(), objective.getDescription());
            objectives.add(newObjective);
        }

        if (request.getAssignedTo().length > 1) {
            User user2 = userRepository.findByEmail(request.getAssignedTo()[1]);

            TaskStatus foundStatus = user2.getTaskStatuses().stream()
                    .filter(taskStatus -> taskStatus.getStatus().equals(status.get().getStatus()))
                    .findFirst()
                    .orElse(null);

            if (foundStatus == null) {
                TaskStatus newStatus = new TaskStatus(status.get().getStatus());
                newStatus.setUser(user2);
                newStatus.setOrderNumber(user2.getTaskStatuses().size() > 0 ? user2.getTaskStatuses().size() - 1 : 0);
                foundStatus = newStatus;
            }

            saveTask(request, difficultyLevel, job, objectives, user2, foundStatus);
        } else {
            saveTask(request, difficultyLevel, job, objectives, user, status.get());
        }

    }

    @Override
    public void deleteTasks(List<TaskDTO> tasks) {
        for (TaskDTO task : tasks) {
            this.deleteTask(task.getId());
        }
    }

    @Override
    public void deleteTask(Long id) {
        Optional<Task> task = taskRepository.findById(id);

        if (task.isEmpty()) {
            throw new TaskNotFoundException("Task not exist");
        }

        taskRepository.deleteById(id);
    }

    @Override
    public List<TaskDTO> getTaskByStatusId(Long valueOf) {
        Optional<TaskStatus> status = taskStatusRepository.findById(valueOf);

        if (status.isEmpty()) {
            throw new TaskStatusException("Task status not found");
        }

        return status.get().getTasks().stream().map(task -> TaskMapper.mapToTaskDTO(task)).collect(Collectors.toList());
    }

    @Override
    public TaskDTO updateTask(Long id, TaskDTO updatedTask) {
        Task task = taskRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Task is not exist with id: " + id)
        );

        TaskStatus status = task.getTaskStatus();

        task.setName(updatedTask.getName());
        task.setSubject(updatedTask.getSubject());
        task.setDeadlineDateTime(updatedTask.getDeadlineDateTime());
        task.setObjectivesList(new ArrayList<>(Arrays.asList(updatedTask.getObjectivesList())));
        task.setPercentage(updatedTask.getPercentage());

        String level = updatedTask.getDifficultyLevel();
        if (level != null) {
            switch (level) {
                case "EASY":
                    task.setDifficultyLevel(DifficultyLevel.EASY);
                    break;
                case "DIFFICULT":
                    task.setDifficultyLevel(DifficultyLevel.DIFFICULT);
                    break;
                case "INTERMEDIATE":
                    task.setDifficultyLevel(DifficultyLevel.INTERMEDIATE);
                    break;
                default:
                    task.setDifficultyLevel(DifficultyLevel.NONE);
            }
        }

        taskStatusRepository.save(status);

        return TaskMapper.mapToTaskDTO(taskRepository.save(task));
    }

    @Override
    public List<TaskDTO> getTasksByAssignedTo(String assignedTo) {
        User user = userRepository.findByEmail(assignedTo);

        if (user != null) {
            return user.getTasks().stream().map(
                            element -> TaskMapper.mapToTaskDTO(element))
                    .sorted(Comparator.comparingInt(TaskDTO::getOrderNumber))
                    .collect(Collectors.toList());
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public TaskDTO getTaskById(Long id) {
        Optional<Task> task = taskRepository.findById(id);

        if (task.isEmpty()) {
            throw new TaskNotFoundException("Task not found");
        }

        return TaskMapper.mapToTaskDTO(task.get());
    }

    @Override
    public void moveState(int taskId1, int taskId2, int[] taskIds) {
        if (taskIds == null || taskIds.length == 0) {
            throw new IllegalArgumentException("User task IDs array is null or empty");
        }

        Optional<Task> task = taskRepository.findById(Long.valueOf(taskId1));
        Optional<Task> task2 = taskRepository.findById(Long.valueOf(taskId2));
        Optional<TaskStatus> taskStatus = task.isPresent() ? taskStatusRepository.findById(Long.valueOf(task.get().getTaskStatus().getId())) : null;
        Optional<TaskStatus> taskStatus2 = task2.isPresent() ? taskStatusRepository.findById(Long.valueOf(task2.get().getTaskStatus().getId())) : null;

        if (task.isEmpty() || task2.isEmpty() || taskStatus.isEmpty() || taskStatus2.isEmpty()) {
            throw new IllegalArgumentException("One or both of the provided Task IDs do not exist");
        }

        int fromIndex = -1;
        int toIndex = -1;
        for (int i = 0; i < taskIds.length; i++) {
            if (taskIds[i] == taskId1) {
                fromIndex = i;
            } else if (taskIds[i] == taskId2) {
                toIndex = i;
            }
        }

        if (fromIndex < toIndex) {
            int temp = taskIds[fromIndex];
            for (int i = fromIndex; i < toIndex; i++) {
                taskIds[i] = taskIds[i + 1];
            }
            taskIds[toIndex] = temp;
        } else {
            int temp = taskIds[fromIndex];
            for (int i = fromIndex; i > toIndex; i--) {
                taskIds[i] = taskIds[i - 1];
            }
            taskIds[toIndex] = temp;
        }

        if (!task.get().getTaskStatus().getStatus().equals(task2.get().getTaskStatus().getStatus())) {
            Task taskToRemove = taskRepository.findById(Long.valueOf(taskId1)).get();

            taskToRemove.setTaskStatus(taskStatus2.get());

            taskRepository.save(taskToRemove);

            taskStatus.get().getTasks().remove(taskToRemove);
            taskStatus2.get().getTasks().add(taskToRemove);

            taskStatusRepository.save(taskStatus.get());
            taskStatusRepository.save(taskStatus2.get());
        }

        for (int i = 0; i < taskIds.length; i++) {
            int taskStatusId = taskIds[i];
            Task taskToSave = taskRepository.findById(Long.valueOf(taskStatusId)).get();
            taskToSave.setOrderNumber(i);
            taskRepository.save(taskToSave);
        }
    }

    @Override
    public void move(int stateId1, int taskId1) {
        Optional<Task> task = taskRepository.findById(Long.valueOf(stateId1));
        Optional<TaskStatus> taskStatus = taskStatusRepository.findById(Long.valueOf(taskId1));

        if (task.isEmpty() || taskStatus.isEmpty()) {
            throw new IllegalArgumentException("Task and status not exist");
        }

        User user = task.get().getUsers().get(0);

        user.getTaskStatuses().remove(taskStatus.get());
        user.getTasks().remove(task);

        task.get().setTaskStatus(taskStatus.get());
        taskStatus.get().getTasks().add(task.get());

        user.getTasks().add(task.get());
        user.getTaskStatuses().add(taskStatus.get());

        taskStatusRepository.save(taskStatus.get());
        taskRepository.save(task.get());

        userRepository.save(user);
    }

    @Override
    public void deleteTasksByJobTitle(String title) {
        Job job = jobRepository.findByTitle(title);

        if (job != null) {
            this.deleteTasks(job.getTasks().stream().map(
                            element -> TaskMapper.mapToTaskDTO(element)).
                    collect(Collectors.toList()));
        }
    }

    @Override
    public List<TaskDTO> getTasksByJob(String title) {
        Job job = jobRepository.findByTitle(title);

        if (job != null) {
            return job.getTasks().stream().map(
                            element -> TaskMapper.mapToTaskDTO(element))
                    .collect(Collectors.toList());
        } else {
            throw new JobNotFoundException("Job not found");
        }
    }

    @Override
    public void deleteTasksByJobTitleAndEmail(String title, String email) {
        Job job = jobRepository.findByTitle(title);

        if (job != null) {
            this.deleteTasks(job.getTasks().stream().
                    filter(element -> element.getUsers().get(0).getEmail().equals(email)).
                    map(element -> TaskMapper.mapToTaskDTO(element)).
                    collect(Collectors.toList()));
        }
    }

    @Override
    public void deleteTasksByEmail(String email) {
        User user = userRepository.findByEmail(email);

        if (user != null) {
            this.deleteTasks(user.getTasks().stream().map(
                            element -> TaskMapper.mapToTaskDTO(element)).
                    collect(Collectors.toList()));
        }
    }

    private void saveTask(TaskDTO request, DifficultyLevel difficultyLevel, Job job, List<Objective> objectives, User user2, TaskStatus foundStatus) {
        Task createdTask = Task.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .deadlineDateTime(request.getDeadlineDateTime())
                .job(job)
                .attachedResources(request.getAttachedResources())
                .objectivesList(objectives)
                .taskStatus(foundStatus)
                .difficultyLevel(difficultyLevel)
                .build();

        createdTask.setUsers(new ArrayList<>());
        createdTask.setOrderNumber(user2.getTasks().size() > 0 ? user2.getTasks().size() - 1 : 0);
        job.setTasks(new ArrayList<>());

        job.getTasks().add(createdTask);
        user2.getTasks().add(createdTask);
        createdTask.getUsers().add(user2);
        user2.getTaskStatuses().add(foundStatus);
        foundStatus.getTasks().add(createdTask);

        jobRepository.save(job);
        userRepository.save(user2);
        taskRepository.save(createdTask);
        taskStatusRepository.save(foundStatus);
    }


    private static DifficultyLevel getDifficultyLevel(String level) {
        DifficultyLevel difficultyLevel;
        if (level.equals(DifficultyLevel.EASY.toString())) {
            difficultyLevel = DifficultyLevel.EASY;
        } else if (level.equals(DifficultyLevel.INTERMEDIATE.toString())) {
            difficultyLevel = DifficultyLevel.INTERMEDIATE;
        } else if (level.equals(DifficultyLevel.DIFFICULT.toString())) {
            difficultyLevel = DifficultyLevel.DIFFICULT;
        } else {
            difficultyLevel = DifficultyLevel.NONE;
        }
        return difficultyLevel;
    }

}
