package com.example.trabajosacademicos.repositories;

import com.example.trabajosacademicos.entities.JobUserRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobUserRelationRepository extends JpaRepository<JobUserRelation, Long> {
    @Query("SELECT f FROM JobUserRelation f WHERE f.user.email = :requestEmail AND f.job.title = :title")
    JobUserRelation findByUserAndJob(@Param("requestEmail") String requestEmail, @Param("title") String title);
    @Query("SELECT f FROM JobUserRelation f WHERE f.job.title = :title")
    List<JobUserRelation> findByJob(@Param("title") String title);
    @Query("SELECT f FROM JobUserRelation f WHERE f.user.email = :sender")
    List<JobUserRelation> findByUser(@Param("sender") String sender);
}
