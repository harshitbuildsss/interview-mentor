package com.harshit.interviewmentor.repository;

import com.harshit.interviewmentor.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<InterviewSession, Integer> {
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Integer userId);
    List<InterviewSession> findTop3ByUserIdOrderByCreatedAtDesc(Integer userId);
}