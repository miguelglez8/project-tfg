package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.dtos.CallDTO;
import com.example.trabajosacademicos.entities.Call;
import com.example.trabajosacademicos.entities.CallType;
import com.example.trabajosacademicos.entities.ModeCallType;
import com.example.trabajosacademicos.entities.User;
import com.example.trabajosacademicos.mappers.CallMapper;
import com.example.trabajosacademicos.repositories.CallRepository;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.services.CallService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CallServiceImpl implements CallService {
    private final CallRepository callRepository;
    private final UserRepository userRepository;

    @Override
    public List<CallDTO> getCallsByUser(String assignedTo) {
        User user = userRepository.findByEmail(assignedTo);
        return user.getCalls().stream().
                map(element -> CallMapper.mapToCallDTO(element, userRepository.findByEmail(element.getUserCall()))).
                sorted(Comparator.comparing(CallDTO::getDate).reversed()).
                collect(Collectors.toList());
    }

    @Override
    public void addCall(CallDTO request) {
        User user = userRepository.findByEmail(request.getUserCalled());
        User userCall = userRepository.findByEmail(request.getUserCall());

        Call createdCall = Call.builder()
            .firstName(userCall.getFirstName())
            .lastName(userCall.getLastName())
            .userCall(request.getUserCall())
            .userCalled(user)
            .duration(request.getDuration())
            .date(request.getDate().plusHours(2))
            .type(request.getType().equals("incoming") ? CallType.INCOMING :
                 (request.getType().equals("outgoing") ? CallType.OUTGOING :
                 (request.getType().equals("miss") ? CallType.MISS : CallType.CANCEL)))
            .callType(request.getCallType().equals("call") ? ModeCallType.CALL : ModeCallType.VIDEOCALL)
            .build();

        if (user.getCalls() == null) user.setCalls(new ArrayList<>());
        user.getCalls().add(0, createdCall);

        callRepository.save(createdCall);
        userRepository.save(user);
    }

    @Override
    public void deleteByUser(String email) {
        User user = userRepository.findByEmail(email);
        List<Call> calls = user.getCalls();
        List<Call> callsToCall = callRepository.findByUserCall(email);

        callRepository.deleteAll(calls);
        callRepository.deleteAll(callsToCall);
    }
}
