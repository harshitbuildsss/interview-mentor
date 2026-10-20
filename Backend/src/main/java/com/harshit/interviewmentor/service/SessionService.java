package com.harshit.interviewmentor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harshit.interviewmentor.dto.request.StartSessionRequest;
import com.harshit.interviewmentor.dto.response.QuestionDTO;
import com.harshit.interviewmentor.dto.response.SessionStartResponse;
import com.harshit.interviewmentor.exception.ResourceNotFoundException;
import com.harshit.interviewmentor.model.*;
import com.harshit.interviewmentor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private TopicScoreRepository topicScoreRepository;

    @Autowired
    private GroqService groqService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // START A NEW SESSION
    public SessionStartResponse startSession(
            StartSessionRequest req,
            Integer authenticatedUserId) {

        // Always use the authenticated user's ID.
        User user = userRepository.findById(authenticatedUserId)
            .orElseThrow(() ->
                new ResourceNotFoundException("User not found."));

        // Fetch the requested resume.
        Resume resume = resumeRepository.findById(req.getResumeId())
            .orElseThrow(() ->
                new ResourceNotFoundException("Resume not found."));

        // Verify that the resume belongs to the authenticated user.
        if (!resume.getUser().getId().equals(authenticatedUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                "You cannot use another user's resume.");
        }

        // Build adaptive context using the authenticated user's history.
        String weakTopicsSummary =
            buildWeakTopicsSummary(authenticatedUserId);

        String previousQuestionsSummary =
            buildPreviousQuestionsSummary(authenticatedUserId);

        // Truncate inputs to safeguard token limits.
        String trimmedJd = req.getJdText();

        if (trimmedJd != null && trimmedJd.length() > 800) {
            trimmedJd = trimmedJd.substring(0, 800);
        }

        String trimmedResume = resume.getExtractedText();

        if (trimmedResume != null && trimmedResume.length() > 1500) {
            trimmedResume = trimmedResume.substring(0, 1500);
        }

        // Generate interview questions.
        String groqResponse = groqService.generateQuestions(
            trimmedResume,
            trimmedJd,
            req.getMode(),
            req.getDifficulty(),
            weakTopicsSummary,
            previousQuestionsSummary
        );

        // Parse the AI response.
        List<JsonNode> questionNodes = parseJsonArray(groqResponse);

        // Save the session under the authenticated user.
        InterviewSession session = new InterviewSession();

        session.setUser(user);
        session.setResume(resume);
        session.setJdText(req.getJdText());
        session.setMode(
            InterviewSession.Mode.valueOf(req.getMode())
        );
        session.setDifficulty(
            InterviewSession.Difficulty.valueOf(req.getDifficulty())
        );

        InterviewSession savedSession =
            sessionRepository.save(session);

        // Save the generated questions.
        List<QuestionDTO> questionDTOs = new ArrayList<>();

        for (JsonNode node : questionNodes) {
            Question question = new Question();

            question.setSession(savedSession);
            question.setQuestion(node.path("question").asText());
            question.setTopic(node.path("topic").asText());
            question.setOrderIndex(node.path("orderIndex").asInt());

            Question savedQuestion =
                questionRepository.save(question);

            questionDTOs.add(new QuestionDTO(
                savedQuestion.getId(),
                savedQuestion.getOrderIndex(),
                savedQuestion.getTopic(),
                savedQuestion.getQuestion()
            ));
        }

        return new SessionStartResponse(
            savedSession.getId(),
            req.getMode(),
            req.getDifficulty(),
            questionDTOs
        );
    }

    // GET A SESSION
    public InterviewSession getSession(Integer sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Session not found."));
    }

    // GET SESSIONS FOR A PARTICULAR USER
    public List<InterviewSession> getUserSessions(Integer userId) {
        return sessionRepository
            .findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ADAPTIVE ENGINE HELPERS

    private String buildWeakTopicsSummary(Integer userId) {
        List<InterviewSession> recentSessions =
            sessionRepository
                .findTop3ByUserIdOrderByCreatedAtDesc(userId);

        if (recentSessions.isEmpty()) {
            return "";
        }

        List<Integer> sessionIds = recentSessions.stream()
            .map(InterviewSession::getId)
            .collect(Collectors.toList());

        List<TopicScore> recentScores =
            topicScoreRepository.findBySessionIdIn(sessionIds);

        if (recentScores.isEmpty()) {
            return "";
        }

        return recentScores.stream()
            .collect(Collectors.groupingBy(
                TopicScore::getTopic,
                Collectors.averagingDouble(TopicScore::getScore)
            ))
            .entrySet()
            .stream()
            .filter(entry -> entry.getValue() < 6.0)
            .map(entry -> entry.getKey()
                + " (avg: "
                + String.format("%.1f", entry.getValue())
                + "/10)")
            .collect(Collectors.joining(", "));
    }

    private String buildPreviousQuestionsSummary(Integer userId) {
        List<InterviewSession> recentSessions =
            sessionRepository
                .findTop3ByUserIdOrderByCreatedAtDesc(userId);

        if (recentSessions.isEmpty()) {
            return "";
        }

        return recentSessions.stream()
            .flatMap(session ->
                questionRepository
                    .findBySessionIdOrderByOrderIndexAsc(
                        session.getId()
                    )
                    .stream()
            )
            .map(Question::getQuestion)
            .collect(Collectors.joining(" | "));
    }

    // JSON PARSING HELPER

    private List<JsonNode> parseJsonArray(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);

            JsonNode questions;

            if (root.isArray()) {
                questions = root;
            } else if (root.isObject()
                    && root.path("questions").isArray()) {
                questions = root.path("questions");
            } else {
                throw new RuntimeException(
                    "AI response must contain a questions array."
                );
            }

            if (questions.isEmpty()) {
                throw new RuntimeException(
                    "AI returned an empty questions array."
                );
            }

            if (questions.size() != 7) {
                throw new RuntimeException(
                    "Expected 7 questions but received "
                        + questions.size()
                );
            }

            List<JsonNode> nodes = new ArrayList<>();
            questions.forEach(nodes::add);

            return nodes;

        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to parse questions: " + e.getMessage(),
                e
            );
        }
    }
}