package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.entities.Friendship;
import com.example.trabajosacademicos.entities.User;
import com.example.trabajosacademicos.exception.FriendshipException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.repositories.FriendshipRepository;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.dtos.FriendshipDTO;
import com.example.trabajosacademicos.services.FriendshipService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FriendshipServiceImpl implements FriendshipService {
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @Override
    public void sendFriendshipRequest(FriendshipDTO friendshipDTO) {
        User sender = userRepository.findByEmail(friendshipDTO.getSenderEmail());
        User receiver = userRepository.findByEmail(friendshipDTO.getReceiverEmail());
        String message = friendshipDTO.getMessage();

        if (sender != null && receiver != null) {
            if (!friendshipRepository.findBySenderAndReceiverEmail(sender.getEmail(), receiver.getEmail()).isEmpty()) {
                throw new FriendshipException("You have already sent him a request");
            }

            if (sender.getFriends().contains(receiver)) {
                throw new FriendshipException("You are already friends");
            }

            Friendship friendship = Friendship.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .message(message)
                    .date(new Date())
                    .build();

            sender.getSentFriendshipRequests().add(0, friendship);

            receiver.getReceivedFriendshipRequests().add(0, friendship);

            friendshipRepository.save(friendship);

            userRepository.save(sender);

            userRepository.save(receiver);

        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public List<FriendshipDTO> getSentFriendshipRequests(String senderEmail) {
        User user = userRepository.findByEmail(senderEmail);

        if (user != null) {
            return user.getSentFriendshipRequests().stream().map(friendship ->
                            new FriendshipDTO(
                                    friendship.getId(),
                                    friendship.getSender().getEmail(),
                                    friendship.getReceiver().getEmail(),
                                    friendship.getMessage(),
                                    friendship.getDate()))
                    .collect(Collectors.toList());
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public void cancelFriendshipRequest(String senderEmail, String receiverEmail) {
        User sender = userRepository.findByEmail(senderEmail);
        User receiver = userRepository.findByEmail(receiverEmail);
        List<Friendship> friendships = friendshipRepository.findBySenderAndReceiverEmail(senderEmail, receiverEmail);

        if (sender != null && receiver != null && !friendships.isEmpty()) {
            friendships.forEach(el -> friendshipRepository.delete(el));
        } else {
            throw new FriendshipException("Friendship not found");
        }
    }

    @Override
    public void acceptFriendshipRequest(String senderEmail, String receiverEmail) {
        User sender = userRepository.findByEmail(senderEmail);
        User receiver = userRepository.findByEmail(receiverEmail);
        List<Friendship> friendships = friendshipRepository.findBySenderAndReceiverEmail(senderEmail, receiverEmail);

        if (sender != null && receiver != null && !friendships.isEmpty()) {
            friendships.forEach(el -> friendshipRepository.delete(el));

            sender.getFriends().add(receiver);
            receiver.getFriends().add(sender);

            userRepository.saveAll(List.of(sender, receiver));
        } else {
            throw new FriendshipException("Friendship not found");
        }
    }

    @Override
    public List<FriendshipDTO> getReceivedFriendshipRequests(String receiverEmail) {
        User user = userRepository.findByEmail(receiverEmail);

        if (user != null) {
            return user.getReceivedFriendshipRequests().stream().map(friendship ->
                            new FriendshipDTO(
                                    friendship.getId(),
                                    friendship.getSender().getEmail(),
                                    friendship.getReceiver().getEmail(),
                                    friendship.getMessage(),
                                    friendship.getDate()))
                    .collect(Collectors.toList());
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public void deleteAllFriendship(Long id) {
        List<Friendship> friendships = friendshipRepository.findBySenderIdOrReceiverId(id);
        if (!friendships.isEmpty()) {
            friendshipRepository.deleteAll(friendships);
        }
    }
}
