package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.entities.Objective;
import com.example.trabajosacademicos.responses.StatsResponse;
import com.example.trabajosacademicos.services.StatsService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class StatsServiceImpl implements StatsService {
    @Override
    public StatsResponse getStats(List<TaskDTO> tasks, List<EventDTO> events, List<JobDTO> jobs) {
        StatsResponse statsResponse = new StatsResponse();

        statsResponse.setParticipatingJobs(jobs.size());
        statsResponse.setAverageJobGrade(calculateAverageJobGrade(jobs));
        statsResponse.setCompletedJobsPercentage(calculateCompletedJobsPercentage(jobs));
        statsResponse.setJobsDeadlineStatusPercentage(calculateJobsDeadlineStatusPercentage(jobs));
        statsResponse.setAverageTasksPerJob(calculateAverageTasksPerJob(tasks, jobs));
        statsResponse.setAverageEventsPerJob(calculateAverageEventsPerJob(events, jobs));

        statsResponse.setAssignedTasks(tasks.size());
        statsResponse.setRealizedTasks((int) tasks.stream().filter(task -> task.getPercentage() == 100).count());
        statsResponse.setCompletedTasksPercentage(calculateCompletedTasksPercentage(tasks));
        statsResponse.setRemainingTasksPercentage(calculateRemainingTasksPercentage(tasks));
        statsResponse.setAverageObjectivesPerTask(calculateAverageObjectivesPerTask(tasks));
        statsResponse.setCompletedObjectivesPercentage(calculateCompletedObjectivesPercentage(tasks));
        statsResponse.setTasksDeadlineStatusPercentage(calculateTasksDeadlineStatusPercentage(tasks));

        statsResponse.setFullTimeEvents((int) events.stream().filter(EventDTO::isAllDay).count());
        statsResponse.setPartTimeEvents(events.size() - statsResponse.getFullTimeEvents());
        statsResponse.setAverageEventDuration(calculateAverageEventDurationInHours(events));
        statsResponse.setAverageParticipantsPerEvent(calculateAverageParticipantsPerEvent(events));

        return statsResponse;
    }

    private double calculateAverageJobGrade(List<JobDTO> jobs) {
        double totalGrade = jobs.stream().mapToDouble(JobDTO::getNote).sum();
        return Math.round((totalGrade / jobs.size()) * 100.0) / 100.0;
    }

    private double calculateCompletedJobsPercentage(List<JobDTO> jobs) {
        long completedJobs = jobs.stream().filter(job -> job.getNote() > 0).count();
        return Math.round(((double) completedJobs / jobs.size() * 100) * 100.0) / 100.0;
    }

    private double calculateJobsDeadlineStatusPercentage(List<JobDTO> jobs) {
        long jobsWithNoteAndExpiredDeadline = jobs.stream()
                .filter(job -> job.getNote() == 0 && job.getDeadlineDateTime().isBefore(LocalDateTime.now()))
                .count();
        return Math.round(((double) jobsWithNoteAndExpiredDeadline / jobs.size() * 100) * 100.0) / 100.0;
    }

    private double calculateAverageTasksPerJob(List<TaskDTO> tasks, List<JobDTO> jobs) {
        int totalTasksCount = tasks.size();
        int totalJobsCount = jobs.size();

        return Math.round(((double) totalTasksCount / totalJobsCount) * 100.0) / 100.0;
    }

    private double calculateAverageEventsPerJob(List<EventDTO> events, List<JobDTO> jobs) {
        int totalEventsCount = events.size();
        int totalJobsCount = jobs.size();

        return Math.round(((double) totalEventsCount / totalJobsCount) * 100.0) / 100.0;
    }

    private double calculateCompletedTasksPercentage(List<TaskDTO> tasks) {
        long completedTasks = tasks.stream().filter(task -> task.getPercentage() == 100).count();
        return Math.round(((double) completedTasks / tasks.size() * 100) * 100.0) / 100.0;
    }

    private double calculateRemainingTasksPercentage(List<TaskDTO> tasks) {
        long incompleteTasksCount = tasks.stream()
                .filter(task -> task.getPercentage() < 100)
                .count();

        if (incompleteTasksCount == 0 || tasks.size() == 0) {
            return 0;
        }

        double totalCompletedPercentageOfIncompleteTasks = tasks.stream()
                .filter(task -> task.getPercentage() < 100)
                .mapToDouble(TaskDTO::getPercentage)
                .sum();

        double percentage = (totalCompletedPercentageOfIncompleteTasks / (incompleteTasksCount * 100)) * 100;

        return Math.round(percentage * 100.0) / 100.0;
    }

    private double calculateAverageObjectivesPerTask(List<TaskDTO> tasks) {
        double totalObjectives = tasks.stream().mapToInt(task -> task.getObjectivesList().length).sum();
        double averageObjectivesPerTask = totalObjectives / tasks.size();
        return Math.round(averageObjectivesPerTask * 100.0) / 100.0;
    }


    private double calculateCompletedObjectivesPercentage(List<TaskDTO> tasks) {
        int totalObjectivesCount = 0;
        int completedObjectivesCount = 0;

        for (TaskDTO task : tasks) {
            for (Objective objective : task.getObjectivesList()) {
                totalObjectivesCount++;
                if (objective.getIsCompleted() == 1) {
                    completedObjectivesCount++;
                }
            }
        }

        if (totalObjectivesCount == 0) {
            return 0;
        }

        return Math.round(((double) completedObjectivesCount / totalObjectivesCount * 100) * 100.0) / 100.0;
    }

    private double calculateTasksDeadlineStatusPercentage(List<TaskDTO> tasks) {
        long expiredTasks = tasks.stream()
                .filter(task -> task.getDeadlineDateTime().isBefore(LocalDateTime.now()))
                .filter(task -> task.getPercentage() != 100)
                .count();
        return Math.round(((double) expiredTasks / tasks.size() * 100) * 100.0) / 100.0;
    }

    private double calculateAverageEventDurationInHours(List<EventDTO> events) {
        long totalDurationSeconds = 0;
        int nonAllDayEventsCount = 0;

        for (EventDTO event : events) {
            if (!event.isAllDay()) {
                Duration eventDuration = Duration.between(event.getDeadlineDateTimeInit(), event.getDeadlineDateTimeFin());
                totalDurationSeconds += eventDuration.getSeconds();
                nonAllDayEventsCount++;
            }
        }

        if (nonAllDayEventsCount > 0) {
            double averageDurationSeconds = (double) totalDurationSeconds / nonAllDayEventsCount;
            double averageDurationHours = averageDurationSeconds / 3600;
            return Math.round(averageDurationHours * 100.0) / 100.0;
        } else {
            return 0;
        }
    }


    private double calculateAverageParticipantsPerEvent(List<EventDTO> events) {
        int totalParticipants = events.stream().mapToInt(event -> event.getAssignedTo().length).sum();
        return Math.round(((double) totalParticipants / events.size()) * 100.0) / 100.0;
    }

}