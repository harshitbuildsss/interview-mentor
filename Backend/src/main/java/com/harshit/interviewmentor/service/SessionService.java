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

    @Autowired private UserRepository         userRepository;
    @Autowired private ResumeRepository       resumeRepository;
    @Autowired private SessionRepository      sessionRepository;
    @Autowired private QuestionRepository     questionRepository;
    @Autowired private TopicScoreRepository   topicScoreRepository;
    @Autowired private GroqService            groqService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─── START A NEW SESSION ────────────────────────────────────────────────
    public SessionStartResponse startSession(StartSessionRequest req) {

        // 1. Fetch user and resume
        User user = userRepository.findById(req.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Resume resume = resumeRepository.findById(req.getResumeId())
            .orElseThrow(() -> new ResourceNotFoundException("Resume not found."));

        // 2. Build adaptive context from previous sessions
        String weakTopicsSummary        = buildWeakTopicsSummary(req.getUserId());
        String previousQuestionsSummary = buildPreviousQuestionsSummary(req.getUserId());

        // 3. Truncate inputs to safeguard token limits
        String trimmedJd = req.getJdText();
        if (trimmedJd != null && trimmedJd.length() > 800) {
            trimmedJd = trimmedJd.substring(0, 800);
        }

        String trimmedResume = resume.getExtractedText();
        if (trimmedResume != null && trimmedResume.length() > 1500) {
            trimmedResume = trimmedResume.substring(0, 1500);
        }

        // 4. Call Groq service
        String groqResponse = groqService.generateQuestions(
            trimmedResume,
            trimmedJd,
            req.getMode(),
            req.getDifficulty(),
            weakTopicsSummary,
            previousQuestionsSummary
        );

        // 5. Parse JSON response into question objects
        List<JsonNode> questionNodes = parseJsonArray(groqResponse);

        // 6. Save new session to DB
        InterviewSession session = new InterviewSession();
        session.setUser(user);
        session.setResume(resume);
        session.setJdText(req.getJdText());
        session.setMode(InterviewSession.Mode.valueOf(req.getMode()));
        session.setDifficulty(
            InterviewSession.Difficulty.valueOf(req.getDifficulty())
        );
        InterviewSession savedSession = sessionRepository.save(session);

        // 7. Save each question to DB
        List<QuestionDTO> questionDTOs = new ArrayList<>();

        for (JsonNode node : questionNodes) {
            Question q = new Question();
            q.setSession(savedSession);
            q.setQuestion(node.path("question").asText());
            q.setTopic(node.path("topic").asText());
            q.setOrderIndex(node.path("orderIndex").asInt());

            Question saved = questionRepository.save(q);

            questionDTOs.add(new QuestionDTO(
                saved.getId(),
                saved.getOrderIndex(),
                saved.getTopic(),
                saved.getQuestion()
            ));
        }

        // 8. Return session ID + all questions
        return new SessionStartResponse(
            savedSession.getId(),
            req.getMode(),
            req.getDifficulty(),
            questionDTOs
        );
    }

    // ─── GET SESSION WITH QUESTIONS ─────────────────────────────────────────
    public InterviewSession getSession(Integer sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Session not found."
            ));
    }

    public List<InterviewSession> getUserSessions(Integer userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADAPTIVE ENGINE HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    private String buildWeakTopicsSummary(Integer userId) {
        List<InterviewSession> recentSessions =
            sessionRepository.findTop3ByUserIdOrderByCreatedAtDesc(userId);

        if (recentSessions.isEmpty()) return "";

        List<Integer> sessionIds = recentSessions.stream()
            .map(InterviewSession::getId)
            .collect(Collectors.toList());

        List<TopicScore> recentScores = topicScoreRepository.findBySessionIdIn(sessionIds);

        if (recentScores.isEmpty()) return "";

        return recentScores.stream()
            .collect(Collectors.groupingBy(
                TopicScore::getTopic,
                Collectors.averagingDouble(TopicScore::getScore)
            ))
            .entrySet().stream()
            .filter(e -> e.getValue() < 6.0)
            .map(e -> e.getKey() + " (avg: "
                + String.format("%.1f", e.getValue()) + "/10)")
            .collect(Collectors.joining(", "));
    }

    private String buildPreviousQuestionsSummary(Integer userId) {
        List<InterviewSession> recentSessions =
            sessionRepository.findTop3ByUserIdOrderByCreatedAtDesc(userId);

        if (recentSessions.isEmpty()) return "";

        return recentSessions.stream()
            .flatMap(s -> questionRepository
                .findBySessionIdOrderByOrderIndexAsc(s.getId()).stream())
            .map(Question::getQuestion)
            .collect(Collectors.joining(" | "));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // JSON PARSING HELPER
    // ═══════════════════════════════════════════════════════════════════════

    private List<JsonNode> parseJsonArray(String rawResponse) {
        try {
            String cleaned = rawResponse
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();

            JsonNode array = objectMapper.readTree(cleaned);

            if (!array.isArray()) {
                throw new RuntimeException(
                    "AI service did not return a JSON array. Response: " + cleaned
                );
            }

            List<JsonNode> nodes = new ArrayList<>();
            array.forEach(nodes::add);
            return nodes;

        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to parse questions: " + e.getMessage()
            );
        }
    }
}