package com.example.trabajosacademicos.repositories;

import com.example.trabajosacademicos.entities.JobInquirie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobInquirieRepository extends JpaRepository<JobInquirie, Long> {
    @Query("SELECT f FROM JobInquirie f WHERE f.user.email = :requestEmail AND f.job.title = :title")
    List<JobInquirie> findBySenderAndTitle(@Param("requestEmail") String requestEmail, @Param("title") String title);
    @Query("SELECT f FROM JobInquirie f WHERE f.job.id = :id")
    List<JobInquirie> findByJobId(@Param("id") Long id);
}
