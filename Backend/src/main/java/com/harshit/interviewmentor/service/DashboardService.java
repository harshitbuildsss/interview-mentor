package com.harshit.interviewmentor.service;

import com.harshit.interviewmentor.model.InterviewSession;
import com.harshit.interviewmentor.repository.SessionRepository;
import com.harshit.interviewmentor.repository.TopicScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    @Autowired private SessionRepository    sessionRepository;
    @Autowired private TopicScoreRepository topicScoreRepository;

    public Map<String, Object> getDashboard(Integer userId) {

        // All completed sessions for this user
        List<InterviewSession> allSessions =
            sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<InterviewSession> completed = allSessions.stream()
            .filter(s -> s.getOverallScore() != null)
            .toList();

        // Overall stats
        int totalSessions = completed.size();

        double averageScore = completed.stream()
            .mapToDouble(InterviewSession::getOverallScore)
            .average()
            .orElse(0.0);
        averageScore = Math.round(averageScore * 10.0) / 10.0;

        // Topic proficiency — from topic_scores table
        List<Object[]> proficiencyRaw =
            topicScoreRepository.findTopicProficiencyByUserId(userId);

        List<Map<String, Object>> topicProficiency = new ArrayList<>();
        List<String> weakestTopics   = new ArrayList<>();
        List<String> strongestTopics = new ArrayList<>();

        for (Object[] row : proficiencyRaw) {
            String topic      = (String) row[0];
            double avgScore   = ((Number) row[1]).doubleValue();
            long   sessCount  = ((Number) row[2]).longValue();

            avgScore = Math.round(avgScore * 10.0) / 10.0;

            topicProficiency.add(Map.of(
                "topic",        topic,
                "averageScore", avgScore,
                "sessionCount", sessCount
            ));

            if (avgScore < 5.0)  weakestTopics.add(topic);
            if (avgScore >= 7.5) strongestTopics.add(topic);
        }

        // Recent 5 sessions
        List<Map<String, Object>> recentSessions = completed.stream()
            .limit(5)
            .map(s -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("sessionId",   s.getId());
                m.put("mode",        s.getMode().name());
                m.put("difficulty",  s.getDifficulty().name());
                m.put("overallScore", s.getOverallScore());
                m.put("completedAt", s.getCompletedAt() != null
                    ? s.getCompletedAt().toString() : null);
                return m;
            })
            .toList();

        // Assemble response
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId",          userId);
        response.put("totalSessions",   totalSessions);
        response.put("averageScore",    averageScore);
        response.put("topicProficiency", topicProficiency);
        response.put("recentSessions",  recentSessions);
        response.put("weakestTopics",   weakestTopics);
        response.put("strongestTopics", strongestTopics);

        return response;
    }
}