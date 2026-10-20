package com.harshit.interviewmentor.controller;

import com.harshit.interviewmentor.model.InterviewSession;
import com.harshit.interviewmentor.model.Question;
import com.harshit.interviewmentor.model.TopicScore;
import com.harshit.interviewmentor.repository.AnswerRepository;
import com.harshit.interviewmentor.repository.QuestionRepository;
import com.harshit.interviewmentor.repository.TopicScoreRepository;
import com.harshit.interviewmentor.service.SessionService;
import com.harshit.interviewmentor.dto.request.StartSessionRequest;
import com.harshit.interviewmentor.dto.response.SessionStartResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private TopicScoreRepository topicScoreRepository;

    // START A SESSION
    @PostMapping("/start")
    public ResponseEntity<SessionStartResponse> startSession(
            @RequestBody StartSessionRequest request,
            Authentication authentication) {

        Integer authenticatedUserId =
            (Integer) authentication.getPrincipal();

        SessionStartResponse response =
            sessionService.startSession(
                request,
                authenticatedUserId
            );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    // GET A SESSION WITH ITS QUESTIONS
    @GetMapping("/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(
            @PathVariable Integer sessionId,
            Authentication authentication) {

        Integer authenticatedUserId =
            (Integer) authentication.getPrincipal();

        InterviewSession session =
            getOwnedSession(sessionId, authenticatedUserId);

        List<Question> questions =
            questionRepository
                .findBySessionIdOrderByOrderIndexAsc(sessionId);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("sessionId", session.getId());
        response.put("mode", session.getMode().name());
        response.put("difficulty", session.getDifficulty().name());
        response.put(
            "overallScore",
            session.getOverallScore()
        );
        response.put(
            "completedAt",
            session.getCompletedAt() != null
                ? session.getCompletedAt().toString()
                : null
        );

        response.put(
            "questions",
            questions.stream().map(question -> {
                Map<String, Object> item = new LinkedHashMap<>();

                item.put("questionId", question.getId());
                item.put("topic", question.getTopic());
                item.put("question", question.getQuestion());
                item.put("orderIndex", question.getOrderIndex());

                return item;
            }).toList()
        );

        return ResponseEntity.ok(response);
    }

    // GET ALL SESSIONS FOR THE AUTHENTICATED USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserSessions(
            @PathVariable Integer userId,
            Authentication authentication) {

        Integer authenticatedUserId =
            (Integer) authentication.getPrincipal();

        if (!authenticatedUserId.equals(userId)) {
            throw new AccessDeniedException(
                "You cannot access another user's sessions."
            );
        }

        List<InterviewSession> sessions =
            sessionService.getUserSessions(authenticatedUserId);

        List<Map<String, Object>> response = sessions.stream()
            .map(session -> {
                Map<String, Object> item = new LinkedHashMap<>();

                item.put("sessionId", session.getId());
                item.put("mode", session.getMode().name());
                item.put(
                    "difficulty",
                    session.getDifficulty().name()
                );
                item.put(
                    "overallScore",
                    session.getOverallScore()
                );
                item.put(
                    "completedAt",
                    session.getCompletedAt() != null
                        ? session.getCompletedAt().toString()
                        : null
                );

                return item;
            })
            .toList();

        return ResponseEntity.ok(response);
    }

    // GET A SESSION'S FULL DETAIL
    @GetMapping("/{sessionId}/detail")
    public ResponseEntity<Map<String, Object>> getSessionDetail(
            @PathVariable Integer sessionId,
            Authentication authentication) {

        Integer authenticatedUserId =
            (Integer) authentication.getPrincipal();

        InterviewSession session =
            getOwnedSession(sessionId, authenticatedUserId);

        List<Question> questions =
            questionRepository
                .findBySessionIdOrderByOrderIndexAsc(sessionId);

        List<Map<String, Object>> qaList = questions.stream()
            .map(question -> {
                Map<String, Object> qa = new LinkedHashMap<>();

                qa.put("questionId", question.getId());
                qa.put("orderIndex", question.getOrderIndex());
                qa.put("topic", question.getTopic());
                qa.put("question", question.getQuestion());

                answerRepository.findByQuestionId(question.getId())
                    .ifPresentOrElse(
                        answer -> {
                            qa.put("userAnswer", answer.getUserAnswer());
                            qa.put("score", answer.getScore());
                            qa.put(
                                "interviewerResponse",
                                answer.getInterviewerResponse()
                            );
                            qa.put("whatWasGood", answer.getWhatWasGood());
                            qa.put(
                                "whatWasMissing",
                                answer.getWhatWasMissing()
                            );
                            qa.put("aiFeedback", answer.getAiFeedback());
                        },
                        () -> {
                            qa.put("userAnswer", null);
                            qa.put("score", null);
                            qa.put("interviewerResponse", null);
                            qa.put("whatWasGood", null);
                            qa.put("whatWasMissing", null);
                            qa.put("aiFeedback", null);
                        }
                    );

                return qa;
            })
            .toList();

        List<TopicScore> topicScores =
            topicScoreRepository.findByUserIdAndSessionId(
                authenticatedUserId,
                sessionId
            );

        List<Map<String, Object>> topicScoreList =
            topicScores.stream()
                .map(topicScore -> {
                    Map<String, Object> item = new LinkedHashMap<>();

                    item.put("topic", topicScore.getTopic());
                    item.put("score", topicScore.getScore());

                    return item;
                })
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("sessionId", session.getId());
        response.put("mode", session.getMode().name());
        response.put("difficulty", session.getDifficulty().name());
        response.put("overallScore", session.getOverallScore());
        response.put(
            "completedAt",
            session.getCompletedAt() != null
                ? session.getCompletedAt().toString()
                : null
        );
        response.put("topicScores", topicScoreList);
        response.put("qaList", qaList);

        return ResponseEntity.ok(response);
    }

    // OWNERSHIP CHECK USED BY SESSION RETRIEVAL ENDPOINTS
    private InterviewSession getOwnedSession(
            Integer sessionId,
            Integer authenticatedUserId) {

        InterviewSession session =
            sessionService.getSession(sessionId);

        if (session.getUser() == null
                || !session.getUser().getId()
                    .equals(authenticatedUserId)) {

            throw new AccessDeniedException(
                "You cannot access another user's session."
            );
        }

        return session;
    }
}