package com.example.trabajosacademicos.repositories;

import com.example.trabajosacademicos.entities.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    @Query("SELECT f FROM Friendship f WHERE f.sender.email = :senderEmail AND f.receiver.email = :receiverEmail")
    List<Friendship> findBySenderAndReceiverEmail(@Param("senderEmail") String senderEmail, @Param("receiverEmail") String receiverEmail);

    @Query("SELECT f FROM Friendship f WHERE f.sender.id = :id OR f.receiver.id = :id")
    List<Friendship> findBySenderIdOrReceiverId(Long id);

}

