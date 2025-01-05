package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.JobUserRelationDTO;
import com.example.trabajosacademicos.dtos.UserDTO;

import java.util.List;

public interface JobService {
    void registerJob(JobDTO request);

    List<JobUserRelationDTO> getJobs(String userEmail);

    void updateVisibility(Long relationId);

    void addMemberToTeam(String jobTitle, String userEmail, String user);

    JobDTO getJobByTitle(String title);

    JobDTO updateJob(Long id, JobDTO updatedJob, String user);

    void deleteJobById(Long id);

    void deleteJobRelationsById(Long id);

    void deleteMember(String title, String email, String s);

    void changePermissions(Long id, String email, String user, String role);

    boolean isMember(String jobTitle, String userEmail);

    boolean isAdmin(String jobTitle, String userEmail);

    List<UserDTO> getMembers(String jobTitle, String user);

    void deleteMemberByEmail(String email);

    boolean isCreator(String title, String email);
}
