package com.example.trabajosacademicos.mappers;

import com.example.trabajosacademicos.entities.Job;
import com.example.trabajosacademicos.entities.JobRole;
import com.example.trabajosacademicos.entities.JobUserRelation;
import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.JobUserRelationDTO;

public class JobMapper {
    public static JobUserRelationDTO mapToJobUserRelationDTO(JobUserRelation jobUserRelation) {
        return new JobUserRelationDTO(
                jobUserRelation.getId(),
                jobUserRelation.getJob().getTitle(),
                jobUserRelation.getJob().getType().toString(),
                jobUserRelation.getJob().getPriority().toString(),
                jobUserRelation.isVisible(),
                jobUserRelation.getRole().toString()
        );
    }

    public static JobDTO mapToJobDTO(Job job) {
        String userEmail = "";
        if (!job.getJobUserRelations().isEmpty() && job.getJobUserRelations().get(0).getRole().equals(JobRole.ADMIN)) {
            userEmail = job.getJobUserRelations().get(0).getUser().getEmail();
        }

        return new JobDTO(
                job.getId(),
                userEmail,
                job.getTitle(),
                job.getDescription(),
                job.getType().toString(),
                job.getPriority().toString(),
                job.getRelatedSubject(),
                job.getDeadlineDateTime(),
                job.getNote()
        );
    }
}
