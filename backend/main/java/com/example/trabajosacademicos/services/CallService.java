package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.CallDTO;

import java.util.List;

public interface CallService {

    List<CallDTO> getCallsByUser(String assignedTo);

    void addCall(CallDTO request);

    void deleteByUser(String email);
}
