package com.harshit.interviewmentor.repository;

import com.harshit.interviewmentor.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findBySessionIdOrderByOrderIndexAsc(Integer sessionId);
    List<Question> findBySessionIdAndTopic(Integer sessionId, String topic);
}