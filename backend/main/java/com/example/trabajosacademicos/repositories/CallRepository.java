package com.example.trabajosacademicos.repositories;

import com.example.trabajosacademicos.entities.Call;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CallRepository extends JpaRepository<Call, Long> {
    List<Call> findByUserCall(String email);
}
