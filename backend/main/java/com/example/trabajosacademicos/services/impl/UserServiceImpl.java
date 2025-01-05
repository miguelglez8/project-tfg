package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.entities.Connectivity;
import com.example.trabajosacademicos.entities.Role;
import com.example.trabajosacademicos.entities.User;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.mappers.UserMapper;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.services.UserService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Override
    public void register(UserDTO request) {
        User user = User.builder()
                .role(request.getRole().toString().equals("STUDENT") ? Role.STUDENT : Role.TEACHER)
                .currentConnectivity(Connectivity.OFFLINE)
                .lastConnectivity(Connectivity.AVAILABLE)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .place(request.getPlace())
                .phoneNumber(request.getPhoneNumber())
                .birthdate(request.getBirthdate())
                .build();

        userRepository.save(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream().map(user -> UserMapper.mapToUserDTO(user)).collect(Collectors.toList());
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id).get();

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setBirthdate(userDTO.getBirthdate());
        user.setPlace(userDTO.getPlace());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        String connectivity = userDTO.getCurrentConnectivity();

        if (connectivity != null) {
            switch (connectivity) {
                case "AVAILABLE":
                    user.setCurrentConnectivity(Connectivity.AVAILABLE);
                    user.setLastConnectivity(Connectivity.AVAILABLE);
                    break;
                case "BUSY":
                    user.setCurrentConnectivity(Connectivity.BUSY);
                    user.setLastConnectivity(Connectivity.BUSY);
                    break;
                case "AWAY":
                    user.setCurrentConnectivity(Connectivity.AWAY);
                    user.setLastConnectivity(Connectivity.AWAY);
                    break;
                case "OFFLINE":
                    user.setCurrentConnectivity(Connectivity.OFFLINE);
                    user.setLastConnectivity(Connectivity.OFFLINE);
                    break;
                default:
                    break;
            }
        }

        return UserMapper.mapToUserDTO(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return null;
        }

        return UserMapper.mapToUserDTO(user);
    }

    @Override
    public UserDTO updatePassword(String email, String newPassword) {
        LocalDateTime now = LocalDateTime.now();

        User user = userRepository.findByEmail(email);

        user.setPassword(passwordEncoder.encode(newPassword));

        logger.info("Deleted temporally token for user {} - Date and hour: {}", email, now);

        return UserMapper.mapToUserDTO(userRepository.save(user));
    }

    @Override
    public boolean checkPassword(UserDTO user, String password) {
        String storedPassword = user.getPassword();

        return passwordEncoder.matches(password, storedPassword);
    }

    @Override
    public List<UserDTO> getFriends(String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user != null) {
            return user.getFriends().stream().map(friend -> UserMapper.mapToUserDTO(friend)).collect(Collectors.toList());
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public void removeFriend(String userEmail, String deleteEmail) {
        User user = userRepository.findByEmail(userEmail);
        User friendToRemove = userRepository.findByEmail(deleteEmail);

        if (user != null && friendToRemove != null) {
            user.getFriends().remove(friendToRemove);
            friendToRemove.getFriends().remove(user);

            userRepository.saveAll(List.of(user, friendToRemove));
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public void removeAllFriends(String userEmail) {
        User user = userRepository.findByEmail(userEmail);

        if (user != null) {
            List<User> friendsToRemove = new ArrayList<>(user.getFriends());
            for (User friendToRemove : friendsToRemove) {
                friendToRemove.getFriends().remove(user);
            }
            userRepository.saveAll(friendsToRemove);
        } else {
            throw new UserNotFoundException("User not found");
        }
    }
}
