package com.example.trabajosacademicos.services;

import com.example.trabajosacademicos.dtos.FriendshipDTO;

import java.util.List;

public interface FriendshipService {
    void sendFriendshipRequest(FriendshipDTO friendshipDTO);

    List<FriendshipDTO> getSentFriendshipRequests(String senderEmail);

    void cancelFriendshipRequest(String senderEmail, String receiverEmail);

    void acceptFriendshipRequest(String senderEmail, String receiverEmail);

    List<FriendshipDTO> getReceivedFriendshipRequests(String receiverEmail);

    void deleteAllFriendship(Long id);
}
