package com.harshit.interviewmentor.repository;

import com.harshit.interviewmentor.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Integer> {
    List<Answer> findByQuestionSessionId(Integer sessionId);
    Optional<Answer> findByQuestionId(Integer questionId);
}