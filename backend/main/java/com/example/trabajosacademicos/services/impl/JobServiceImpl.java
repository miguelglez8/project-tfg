package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.entities.*;
import com.example.trabajosacademicos.exception.JobException;
import com.example.trabajosacademicos.exception.JobNotFoundException;
import com.example.trabajosacademicos.exception.ResourceNotFoundException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.mappers.JobMapper;
import com.example.trabajosacademicos.mappers.UserMapper;
import com.example.trabajosacademicos.repositories.*;
import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.JobUserRelationDTO;
import com.example.trabajosacademicos.services.JobService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class JobServiceImpl implements JobService {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobUserRelationRepository jobUserRelationRepository;

    @Override
    public void registerJob(JobDTO request) {
        User user = userRepository.findByEmail(request.getCreator());

        if (jobRepository.findByTitle(request.getTitle()) != null)
            throw new JobException("Job already exists");

        Job job = Job.builder()
                .title(request.getTitle())
                .deadlineDateTime(request.getDeadlineDateTime())
                .description(request.getDescription())
                .type(getType(request.getType()))
                .priority(getPriority(request.getPriority()))
                .relatedSubject(request.getRelatedSubject())
                .note(request.getNote())
                .build();

        JobUserRelation jobUserRelation = new JobUserRelation();
        jobUserRelation.setJob(job);
        jobUserRelation.setUser(user);
        jobUserRelation.setRole(JobRole.ADMIN);
        jobUserRelation.setVisible(true);

        user.getJobUserRelations().add(jobUserRelation);
        job.setJobUserRelations(new ArrayList<>());
        job.getJobUserRelations().add(jobUserRelation);

        jobRepository.save(job);
        userRepository.save(user);

        jobUserRelationRepository.save(jobUserRelation);
    }

    @Override
    public List<JobUserRelationDTO> getJobs(String userEmail) {
        User user = userRepository.findByEmail(userEmail);

        return user.getJobUserRelations().stream().map(
                element -> JobMapper.mapToJobUserRelationDTO(element)
        ).collect(Collectors.toList());
    }

    @Override
    public void updateVisibility(Long relationId) {
        Optional<JobUserRelation> relation = jobUserRelationRepository.findById(relationId);

        if (relation.isEmpty()) {
            throw new JobNotFoundException("Job not found with id: " + relationId);
        }

        relation.get().setVisible(!relation.get().isVisible());

        jobUserRelationRepository.save(relation.get());
    }

    @Override
    public void addMemberToTeam(String title, String userEmail, String email) {
        Job job = jobRepository.findByTitle(title);
        if (job == null) throw new JobNotFoundException("Job not found with title: " + title);

        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new UserNotFoundException("User not found with email: " + userEmail);

        boolean isAdmin = isAdmin(title, email);

        if (!isAdmin) {
            throw new JobException("User is not admin");
        }

        if (isMember(title, userEmail)) {
            throw new JobException("User is already in the team");
        }

        List<JobUserRelation> list = jobUserRelationRepository.findByJob(title);
        if (list.size() == 4) {
            throw new JobException("Job is already completed");
        }

        JobUserRelation newRelation = new JobUserRelation();
        newRelation.setJob(job);
        newRelation.setUser(user);
        newRelation.setRole(JobRole.MEMBER);
        newRelation.setVisible(true);

        job.getJobUserRelations().add(newRelation);
        user.getJobUserRelations().add(newRelation);

        jobUserRelationRepository.save(newRelation);

        jobRepository.save(job);
        userRepository.save(user);
    }

    @Override
    public JobDTO getJobByTitle(String title) {
        Job job = jobRepository.findByTitle(title);

        if (job == null) {
            throw new JobNotFoundException("Job not found");
        }

        return JobMapper.mapToJobDTO(job);
    }

    @Override
    public JobDTO updateJob(Long id, JobDTO updatedJob, String user) {
        Job job = jobRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Job is not exist with id: " + id)
        );

        boolean isAdmin = isAdmin(job.getTitle(), user);

        if (!isAdmin) {
            throw new JobException("User is not admin");
        }

        job.setDescription(updatedJob.getDescription());
        job.setPriority(getPriority(updatedJob.getPriority()));
        job.setRelatedSubject(updatedJob.getRelatedSubject());
        job.setDeadlineDateTime(updatedJob.getDeadlineDateTime());
        job.setNote(updatedJob.getNote());
        job.setType(getType(updatedJob.getType()));

        return JobMapper.mapToJobDTO(jobRepository.save(job));
    }

    @Override
    public void deleteJobById(Long id) {
        jobRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Job is not exist with id: " + id)
        );

        jobRepository.deleteById(id);
    }

    @Override
    public void deleteJobRelationsById(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Job is not exist with id: " + id)
        );

        List<JobUserRelation> jobUserRelations = jobUserRelationRepository.findByJob(job.getTitle());
        if (jobUserRelations.isEmpty() == false) {
            jobUserRelationRepository.deleteAll(jobUserRelations);
        }

    }

    @Override
    public void deleteMember(String title, String email, String userAction) {
        Job job = jobRepository.findByTitle(title);
        if (job == null) throw new JobNotFoundException("Job not found with title: " + title);
        User userr = userRepository.findByEmail(email);
        if (userr == null) throw new UserNotFoundException("User not found with email: " + email);

        boolean isMemberEmail = isMember(title, email);

        if (!isMemberEmail) {
            throw new JobException("User is not in the team");
        }

        JobUserRelation jobUserRelation = jobUserRelationRepository.findByUserAndJob(email, title);

        if (jobUserRelation != null) {
            User user = userRepository.findByEmail(jobUserRelation.getUser().getEmail());
            job.getJobUserRelations().remove(jobUserRelation);
            user.getJobUserRelations().remove(jobUserRelation);

            jobRepository.save(job);
            userRepository.save(user);
        }

        jobUserRelationRepository.delete(jobUserRelation);
    }

    @Override
    public void changePermissions(Long id, String email, String user, String role) {
        Optional<Job> job = jobRepository.findById(id);

        boolean response = isMember(job.get().getTitle(), email);

        if (!response) {
            throw new JobException("User is not in the team");
        }

        boolean isAdmin = isAdmin(job.get().getTitle(), user);

        if (!isAdmin || email.equals(user) || role.equals("STUDENT")) {
            throw new JobException("User is not admin");
        }

        boolean isCreator = isCreator(job.get().getTitle(), user);

        if (!isCreator) {
            throw new JobException("User is not creator");
        }

        JobUserRelation jobUserRelation = jobUserRelationRepository.findByUserAndJob(email, job.get().getTitle());

        if (jobUserRelation != null) {
            JobUserRelation relation = jobUserRelation;

            relation.setRole(relation.getRole().equals(JobRole.MEMBER) ? JobRole.ADMIN : JobRole.MEMBER);

            jobUserRelationRepository.save(relation);
        }
    }

    @Override
    public boolean isMember(String jobTitle, String userEmail) {
        Job job = jobRepository.findByTitle(jobTitle);
        if (job == null) throw new JobNotFoundException("Job not found with title: " + jobTitle);

        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new UserNotFoundException("User not found with email: " + userEmail);

        if (job.getJobUserRelations().stream().filter(
                        elem -> elem.getUser().getEmail().equals(userEmail)).
                collect(Collectors.toList()).isEmpty() == false) {
            return true;
        } else {
            return false;
        }
    }

    @Override
    public boolean isAdmin(String jobTitle, String userEmail) {
        Job job = jobRepository.findByTitle(jobTitle);
        if (job == null) throw new JobNotFoundException("Job not found with title: " + jobTitle);

        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new UserNotFoundException("User not found with email: " + userEmail);

        if (job.getJobUserRelations().stream().filter(
                        elem -> elem.getUser().getEmail().equals(userEmail) &&
                                elem.getRole().equals(JobRole.ADMIN)).
                collect(Collectors.toList()).isEmpty() == false) {
            return true;
        } else {
            return false;
        }
    }

    @Override
    public List<UserDTO> getMembers(String jobTitle, String user) {
        Job job = jobRepository.findByTitle(jobTitle);
        if (job == null) throw new JobNotFoundException("Job not found with title: " + jobTitle);

        if (! isMember(jobTitle,user)) {
            throw new JobException("User is not in the team");
        }

        List<JobUserRelation> list = jobUserRelationRepository.findByJob(jobTitle);
        List<UserDTO> userDTOList = list.stream()
                .map(element -> UserMapper.mapToUserDTO(userRepository.findByEmail(element.getUser().getEmail())))
                .collect(Collectors.toList());

        return userDTOList;
    }

    @Override
    public void deleteMemberByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (!user.getJobUserRelations().isEmpty()) {
            List<JobUserRelation> relationsToRemove = new ArrayList<>(user.getJobUserRelations());
            for (JobUserRelation relation : relationsToRemove) {
                deleteMember(relation.getJob().getTitle(), email, email);
            }
        }
    }

    @Override
    public boolean isCreator(String title, String email) {
        Job job = jobRepository.findByTitle(title);
        if (job == null) throw new JobNotFoundException("Job not found with title: " + title);

        User user = userRepository.findByEmail(email);
        if (user == null) throw new UserNotFoundException("User not found with email: " + email);

        if (job.getJobUserRelations().get(0).getUser().getEmail().equals(email) &&
                job.getJobUserRelations().get(0).getRole().equals(JobRole.ADMIN)) {
            return true;
        } else {
            return false;
        }
    }

    private static JobType getType(String type) {
        if (type != null) {
            if (type.equalsIgnoreCase("TFG")) {
                return JobType.TFG;
            } else if (type.equalsIgnoreCase("TFM")) {
                return JobType.TFM;
            } else if (type.equalsIgnoreCase("THESIS")) {
                return JobType.THESIS;
            } else {
                return JobType.OTHER;
            }
        }
        return JobType.OTHER;
    }

    private static JobPriority getPriority(String priority) {
        if (priority != null) {
            if (priority.equalsIgnoreCase("HIGH")) {
                return JobPriority.HIGH;
            } else if (priority.equalsIgnoreCase("MEDIUM")) {
                return JobPriority.MEDIUM;
            } else if (priority.equalsIgnoreCase("LOW")) {
                return JobPriority.LOW;
            }
        }
        return JobPriority.NONE;
    }
}
