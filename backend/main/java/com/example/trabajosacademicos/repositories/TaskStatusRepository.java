package com.example.trabajosacademicos.repositories;

import com.example.trabajosacademicos.entities.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskStatusRepository extends JpaRepository<TaskStatus, Long> {
    @Query("SELECT ts FROM TaskStatus ts WHERE ts.user.email = ?1")
    List<TaskStatus> findByEmail(String email);
}
