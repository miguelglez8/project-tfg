package com.example.trabajosacademicos.repositories;

import com.example.trabajosacademicos.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.sender = :sender")
    List<Notification> findBySender(String sender);
}
