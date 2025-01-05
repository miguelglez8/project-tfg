package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.UserDTO;

import java.util.List;

public interface UserService {
    void register(UserDTO request);

    List<UserDTO> getAllUsers();

    UserDTO updateUser(Long id, UserDTO request);

    void deleteUser(Long id);

    UserDTO getUserByEmail(String email);

    UserDTO updatePassword(String email, String newPassword);

    boolean checkPassword(UserDTO user, String password);

    List<UserDTO> getFriends(String userEmail);

    void removeFriend(String userEmail, String deleteEmail);

    void removeAllFriends(String userEmail);
}
