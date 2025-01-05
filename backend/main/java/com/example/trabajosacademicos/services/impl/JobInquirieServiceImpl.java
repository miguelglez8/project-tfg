package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.entities.*;
import com.example.trabajosacademicos.exception.JobException;
import com.example.trabajosacademicos.exception.JobNotFoundException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.repositories.JobInquirieRepository;
import com.example.trabajosacademicos.repositories.JobRepository;
import com.example.trabajosacademicos.repositories.JobUserRelationRepository;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.dtos.JobInquirieDTO;
import com.example.trabajosacademicos.services.JobInquirieService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class JobInquirieServiceImpl implements JobInquirieService {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobInquirieRepository jobInquirieRepository;
    private final JobUserRelationRepository jobUserRelationRepository;

    @Override
    public void addJobInquirie(JobInquirieDTO jobInquirieDTO) {
        User user = userRepository.findByEmail(jobInquirieDTO.getSender());
        if (user == null) throw new UserNotFoundException("User not found with email: " + jobInquirieDTO.getSender());

        Job job = jobRepository.findByTitle(jobInquirieDTO.getReceiver());
        if (job == null) throw new JobNotFoundException("Job not found with title: " + jobInquirieDTO.getReceiver());

        if (jobUserRelationRepository.findByUserAndJob(user.getEmail(), job.getTitle()) != null) {
            throw new JobException("You are already in the team");
        }

        if (!jobInquirieRepository.findBySenderAndTitle(user.getEmail(), job.getTitle()).isEmpty()) {
            throw new JobException("You have already sent him a request");
        }

        JobInquirie jobInquirie = new JobInquirie();
        jobInquirie.setUser(user);
        jobInquirie.setJob(job);
        jobInquirie.setMessage(jobInquirieDTO.getMessage());
        jobInquirie.setDate(new Date());

        user.getJobInquiries().add(0, jobInquirie);
        job.getJobInquiries().add(0, jobInquirie);

        jobInquirieRepository.save(jobInquirie);

        jobRepository.save(job);
        userRepository.save(user);
    }

    @Override
    public List<JobInquirieDTO> getReceivedJobInquiriesRequests(String title) {
        Job job = jobRepository.findByTitle(title);

        if (job != null) {
            return job.getJobInquiries().stream().map(jobb ->
                            new JobInquirieDTO(
                                    jobb.getId(),
                                    jobb.getUser().getEmail(),
                                    jobb.getJob().getTitle(),
                                    jobb.getMessage(),
                                    jobb.getDate()))
                    .collect(Collectors.toList());
        } else {
            throw new JobNotFoundException("Job not found");
        }
    }

    @Override
    public void cancelJobInquiriesRequest(String requestEmail, String title) {
        User sender = userRepository.findByEmail(requestEmail);
        Job receiver = jobRepository.findByTitle(title);

        List<JobInquirie> jobInquirieList = jobInquirieRepository.findBySenderAndTitle(requestEmail, title);

        if (sender != null && receiver != null && !jobInquirieList.isEmpty()) {
            jobInquirieList.forEach(el -> jobInquirieRepository.delete(el));
        } else if (receiver == null) {
            throw new JobNotFoundException("Job not found");
        } else if (sender == null) {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public List<JobInquirieDTO> getSentJobInquiriesRequest(String senderEmail) {
        User user = userRepository.findByEmail(senderEmail);

        if (user != null) {
            return user.getJobInquiries().stream().map(job ->
                            new JobInquirieDTO(
                                    job.getId(),
                                    job.getUser().getEmail(),
                                    job.getJob().getTitle(),
                                    job.getMessage(),
                                    job.getDate()))
                    .collect(Collectors.toList());
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public void deleteInquiriesById(Long id) {
        Optional<Job> job = jobRepository.findById(id);
        if (job.isEmpty()) throw new JobNotFoundException("Job not found with id: " + id);

        List<JobInquirie> list = jobInquirieRepository.findByJobId(id);

        if (list.isEmpty() == false) {
            User user = userRepository.findByEmail(list.get(0).getUser().getEmail());
            user.getJobInquiries().removeAll(list);

            userRepository.save(user);
        }
        jobInquirieRepository.deleteAll(list);
    }

    @Override
    public void deleteInquiriesByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new UserNotFoundException("User not found with email: " + email);

        if (user.getJobInquiries().isEmpty() == false) {
            List<JobInquirie> jobInquiries = user.getJobInquiries();
            jobInquirieRepository.deleteAll(jobInquiries);
        }
    }
}
