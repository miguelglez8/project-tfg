package com.example.trabajosacademicos.mappers;

import com.example.trabajosacademicos.dtos.CallDTO;
import com.example.trabajosacademicos.entities.Call;
import com.example.trabajosacademicos.entities.User;

public class CallMapper {
    public static CallDTO mapToCallDTO(Call call, User user) {
        return new CallDTO(
                call.getId(),
                user.getFirstName(),
                user.getLastName(),
                call.getUserCall(),
                call.getType().toString(),
                call.getDuration(),
                call.getDate(),
                call.getCallType().toString(),
                call.getUserCalled().getEmail()
        );
    }
}
