package com.harshit.interviewmentor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harshit.interviewmentor.dto.request.CompleteSessionRequest;
import com.harshit.interviewmentor.dto.request.SubmitAnswerRequest;
import com.harshit.interviewmentor.dto.response.AnswerEvaluationResponse;
import com.harshit.interviewmentor.dto.response.SessionSummaryResponse;
import com.harshit.interviewmentor.exception.ResourceNotFoundException;
import com.harshit.interviewmentor.model.*;
import com.harshit.interviewmentor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AnswerService {

    @Autowired private QuestionRepository   questionRepository;
    @Autowired private AnswerRepository     answerRepository;
    @Autowired private SessionRepository    sessionRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private TopicScoreRepository topicScoreRepository;
    @Autowired private GroqService          groqService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─── SUBMIT ONE ANSWER ──────────────────────────────────────────────────
    public AnswerEvaluationResponse submitAnswer(SubmitAnswerRequest req) {

        // 1. Fetch Question
        Question question = questionRepository.findById(req.getQuestionId())
            .orElseThrow(() -> new ResourceNotFoundException("Question not found."));

        // 2. Fetch Session
        InterviewSession session = sessionRepository.findById(req.getSessionId())
            .orElseThrow(() -> new ResourceNotFoundException("Session not found."));

        // 3. Evaluate via Groq
        String rawEvaluation = groqService.evaluateAnswer(
            question.getQuestion(),
            question.getTopic(),
            req.getUserAnswer(),
            session.getMode().name()
        );

        // 4. Parse evaluation JSON
        JsonNode eval = parseJson(rawEvaluation);

        // 5. Look up existing answer or create new to prevent duplicate key errors
        Answer answer = answerRepository.findByQuestionId(question.getId())
            .orElse(new Answer());

        answer.setQuestion(question);
        answer.setUserAnswer(req.getUserAnswer());
        answer.setScore(eval.path("score").asDouble());
        answer.setInterviewerResponse(eval.path("interviewerResponse").asText());
        answer.setWhatWasGood(eval.path("whatWasGood").asText());
        answer.setWhatWasMissing(eval.path("whatWasMissing").asText());
        answer.setAiFeedback(eval.path("aiFeedback").asText());

        Answer saved = answerRepository.save(answer);

        return new AnswerEvaluationResponse(
            saved.getId(),
            saved.getScore(),
            saved.getInterviewerResponse(),
            saved.getWhatWasGood(),
            saved.getWhatWasMissing(),
            saved.getAiFeedback()
        );
    }

    // ─── COMPLETE SESSION ───────────────────────────────────────────────────
    public SessionSummaryResponse completeSession(CompleteSessionRequest req) {

        InterviewSession session = sessionRepository.findById(req.getSessionId())
            .orElseThrow(() -> new ResourceNotFoundException("Session not found."));

        User user = userRepository.findById(req.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        List<Answer> answers = answerRepository.findByQuestionSessionId(req.getSessionId());

        if (answers.isEmpty()) {
            throw new IllegalArgumentException("No answers found for this session.");
        }

        // Group & average scores per topic
        Map<String, List<Double>> topicScoreMap = new HashMap<>();
        for (Answer a : answers) {
            String topic = a.getQuestion().getTopic();
            topicScoreMap
                .computeIfAbsent(topic, k -> new ArrayList<>())
                .add(a.getScore());
        }

        List<Map<String, Object>> topicScoreList = new ArrayList<>();
        for (Map.Entry<String, List<Double>> entry : topicScoreMap.entrySet()) {
            double avg = entry.getValue().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

            TopicScore ts = new TopicScore();
            ts.setSession(session);
            ts.setUser(user);
            ts.setTopic(entry.getKey());
            ts.setScore(avg);
            topicScoreRepository.save(ts);

            topicScoreList.add(Map.of(
                "topic", entry.getKey(),
                "score", Math.round(avg * 10.0) / 10.0
            ));
        }

        // Overall session score
        double overallScore = answers.stream()
            .mapToDouble(Answer::getScore)
            .average()
            .orElse(0.0);
        overallScore = Math.round(overallScore * 10.0) / 10.0;

        // Generate transcript and coach summary
        String transcript = buildTranscript(answers);
        String rawSummary = groqService.generateSummary(transcript);
        JsonNode summary = parseJson(rawSummary);

        List<String> strengths = new ArrayList<>();
        summary.path("strengths").forEach(n -> strengths.add(n.asText()));

        List<String> weakAreas = new ArrayList<>();
        summary.path("weakAreas").forEach(n -> weakAreas.add(n.asText()));

        List<String> reviseBeforeNext = new ArrayList<>();
        summary.path("reviseBeforeNext").forEach(n -> reviseBeforeNext.add(n.asText()));

        session.setOverallScore(overallScore);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        return new SessionSummaryResponse(
            session.getId(),
            overallScore,
            topicScoreList,
            strengths,
            weakAreas,
            summary.path("summaryParagraph").asText(),
            reviseBeforeNext
        );
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────

    private String buildTranscript(List<Answer> answers) {
        StringBuilder sb = new StringBuilder();
        for (Answer a : answers) {
            sb.append("TOPIC: ").append(a.getQuestion().getTopic()).append("\n");
            sb.append("Q: ").append(a.getQuestion().getQuestion()).append("\n");
            sb.append("A: ").append(a.getUserAnswer()).append("\n");
            sb.append("SCORE: ").append(a.getScore()).append("/10\n");
            sb.append("---\n");
        }
        return sb.toString();
    }

    private JsonNode parseJson(String raw) {
        try {
            String cleaned = raw
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();
            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse LLM response: " + e.getMessage());
        }
    }
}