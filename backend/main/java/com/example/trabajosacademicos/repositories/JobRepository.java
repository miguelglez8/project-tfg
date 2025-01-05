package com.example.trabajosacademicos.repositories;

import com.example.trabajosacademicos.entities.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Job findByTitle(String title);
}
