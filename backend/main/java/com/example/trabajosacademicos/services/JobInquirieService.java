package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.JobInquirieDTO;

import java.util.List;

public interface JobInquirieService {
    void addJobInquirie(JobInquirieDTO jobInquirieDTO);

    List<JobInquirieDTO> getReceivedJobInquiriesRequests(String title);

    void cancelJobInquiriesRequest(String requestEmail, String title);

    List<JobInquirieDTO> getSentJobInquiriesRequest(String senderEmail);

    void deleteInquiriesById(Long id);

    void deleteInquiriesByEmail(String email);
}
