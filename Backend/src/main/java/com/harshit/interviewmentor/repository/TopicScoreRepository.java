package com.harshit.interviewmentor.repository;

import com.harshit.interviewmentor.model.TopicScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopicScoreRepository extends JpaRepository<TopicScore, Integer> {

    List<TopicScore> findByUserIdAndSessionId(Integer userId, Integer sessionId);

    // Average score per topic across all sessions for a user — used for dashboard
    @Query("SELECT ts.topic, AVG(ts.score) as avgScore, COUNT(ts) as sessionCount " +
           "FROM TopicScore ts WHERE ts.user.id = :userId " +
           "GROUP BY ts.topic ORDER BY avgScore ASC")
    List<Object[]> findTopicProficiencyByUserId(Integer userId);

    // Last 3 sessions' topic scores — used for adaptive engine
    @Query("SELECT ts FROM TopicScore ts WHERE ts.user.id = :userId " +
           "AND ts.session.id IN " +
           "(SELECT s.id FROM InterviewSession s WHERE s.user.id = :userId " +
           "ORDER BY s.createdAt DESC LIMIT 3)")
    List<TopicScore> findRecentTopicScores(Integer userId);
    List<TopicScore> findBySessionIdIn(List<Integer> sessionIds);
}