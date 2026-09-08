package com.harshit.interviewmentor.controller;

import com.harshit.interviewmentor.dto.request.StartSessionRequest;
import com.harshit.interviewmentor.dto.response.SessionStartResponse;
import com.harshit.interviewmentor.model.InterviewSession;
import com.harshit.interviewmentor.model.Question;
import com.harshit.interviewmentor.model.TopicScore;
import com.harshit.interviewmentor.repository.QuestionRepository;
import com.harshit.interviewmentor.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


import com.harshit.interviewmentor.model.TopicScore;
import com.harshit.interviewmentor.repository.AnswerRepository;
import com.harshit.interviewmentor.repository.TopicScoreRepository;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired private SessionService    sessionService;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private AnswerRepository     answerRepository;
    @Autowired private TopicScoreRepository topicScoreRepository;
    @PostMapping("/start")
    public ResponseEntity<SessionStartResponse> startSession(
            @RequestBody StartSessionRequest request) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(sessionService.startSession(request));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(
            @PathVariable Integer sessionId) {

        InterviewSession session = sessionService.getSession(sessionId);
        List<Question> questions =
            questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);

        return ResponseEntity.ok(Map.of(
            "sessionId",  session.getId(),
            "mode",       session.getMode().name(),
            "difficulty", session.getDifficulty().name(),
            "overallScore", session.getOverallScore() != null
                ? session.getOverallScore() : "null",
            "completedAt", session.getCompletedAt() != null
                ? session.getCompletedAt().toString() : "null",
            "questions", questions.stream().map(q -> Map.of(
                "questionId", q.getId(),
                "topic",      q.getTopic(),
                "question",   q.getQuestion(),
                "orderIndex", q.getOrderIndex()
            )).toList()
        ));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserSessions(
            @PathVariable Integer userId) {

        List<InterviewSession> sessions =
            sessionService.getUserSessions(userId);

        List<Map<String, Object>> response = sessions.stream()
            .map(s -> Map.<String, Object>of(
                "sessionId",  s.getId(),
                "mode",       s.getMode().name(),
                "difficulty", s.getDifficulty().name(),
                "overallScore", s.getOverallScore() != null
                    ? s.getOverallScore() : "null",
                "completedAt", s.getCompletedAt() != null
                    ? s.getCompletedAt().toString() : "null"
            ))
            .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sessionId}/detail")
    public ResponseEntity<Map<String, Object>> getSessionDetail(
            @PathVariable Integer sessionId) {

        InterviewSession session = sessionService.getSession(sessionId);

        List<Question> questions =
            questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);

        // Build full Q&A pairs
        List<Map<String, Object>> qaList = questions.stream().map(q -> {
            Map<String, Object> qa = new LinkedHashMap<>();
            qa.put("questionId",  q.getId());
            qa.put("orderIndex",  q.getOrderIndex());
            qa.put("topic",       q.getTopic());
            qa.put("question",    q.getQuestion());

            // Fetch answer for this question
            answerRepository.findByQuestionId(q.getId()).ifPresentOrElse(
                a -> {
                    qa.put("userAnswer",          a.getUserAnswer());
                    qa.put("score",               a.getScore());
                    qa.put("interviewerResponse", a.getInterviewerResponse());
                    qa.put("whatWasGood",         a.getWhatWasGood());
                    qa.put("whatWasMissing",      a.getWhatWasMissing());
                    qa.put("aiFeedback",          a.getAiFeedback());
                },
                () -> {
                    qa.put("userAnswer",          null);
                    qa.put("score",               null);
                    qa.put("interviewerResponse", null);
                    qa.put("whatWasGood",         null);
                    qa.put("whatWasMissing",      null);
                    qa.put("aiFeedback",          null);
                }
            );
            return qa;
        }).toList();

        // Topic scores for this session
        List<TopicScore> topicScores =
            topicScoreRepository.findByUserIdAndSessionId(
                session.getUser().getId(), sessionId
            );

        List<Map<String, Object>> topicScoreList = topicScores.stream()
            .map(ts -> Map.<String, Object>of(
                "topic", ts.getTopic(),
                "score", ts.getScore()
            ))
            .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("sessionId",    session.getId());
        response.put("mode",         session.getMode().name());
        response.put("difficulty",   session.getDifficulty().name());
        response.put("overallScore", session.getOverallScore());
        response.put("completedAt",  session.getCompletedAt() != null
            ? session.getCompletedAt().toString() : null);
        response.put("topicScores",  topicScoreList);
        response.put("qaList",       qaList);

        return ResponseEntity.ok(response);
    }
}