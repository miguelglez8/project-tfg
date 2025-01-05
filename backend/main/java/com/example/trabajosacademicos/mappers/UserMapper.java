package com.example.trabajosacademicos.mappers;

import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.entities.User;

public class UserMapper {
    public static UserDTO mapToUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getRole().toString(),
                user.getCurrentConnectivity().toString(),
                user.getLastConnectivity().toString(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPlace(),
                user.getBirthdate(),
                user.getPhoneNumber(),
                user.getPassword(),
                user.getToken()
        );
    }

}
