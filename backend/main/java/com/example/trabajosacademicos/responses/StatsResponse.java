package com.example.trabajosacademicos.responses;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StatsResponse {
    private int participatingJobs;
    private double averageJobGrade;
    private double completedJobsPercentage;
    private double jobsDeadlineStatusPercentage;
    private double averageTasksPerJob;
    private double averageEventsPerJob;
    private int realizedTasks;
    private int assignedTasks;
    private double completedTasksPercentage;
    private double remainingTasksPercentage;
    private double averageObjectivesPerTask;
    private double completedObjectivesPercentage;
    private double tasksDeadlineStatusPercentage;
    private int fullTimeEvents;
    private int partTimeEvents;
    private double averageEventDuration;
    private double averageParticipantsPerEvent;
}
