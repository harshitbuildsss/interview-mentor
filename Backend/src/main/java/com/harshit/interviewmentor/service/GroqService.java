package com.harshit.interviewmentor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class GroqService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String apiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private static final String MODEL = "openai/gpt-oss-20b";

    public GroqService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = new ObjectMapper();
    }

    private String cleanJsonResponse(String rawResponse) {
        if (rawResponse == null) return "{}";
        String cleaned = rawResponse.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private String callGroq(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "messages", new Object[]{
                Map.of(
                    "role", "user",
                    "content", prompt
                )
            },
            "temperature", 0.6
        );

        String response = webClient.post()
            .uri(GROQ_URL)
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .bodyValue(requestBody)
            .retrieve()
            .onStatus(
                status -> status.is4xxClientError() || status.is5xxServerError(),
                clientResponse -> clientResponse.bodyToMono(String.class)
                    .map(errorBody -> new RuntimeException(
                        "Groq API error " +
                        clientResponse.statusCode() + ": " + errorBody
                    ))
            )
            .bodyToMono(String.class)
            .block();

        try {
            JsonNode root = objectMapper.readTree(response);
            String rawContent = root
                .path("choices").get(0)
                .path("message")
                .path("content")
                .asText();

            return cleanJsonResponse(rawContent);
        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to parse Groq response: " + e.getMessage(), e
            );
        }
    }

    // ─── 1. GENERATE INTERVIEW QUESTIONS ───────────────────────────────────
    public String generateQuestions(
            String resumeText,
            String jdText,
            String mode,
            String difficulty,
            String weakTopicsSummary,
            String previousQuestionsSummary) {

        String prompt = buildQuestionPrompt(
            resumeText, jdText, mode, difficulty,
            weakTopicsSummary, previousQuestionsSummary
        );
        return callGroq(prompt);
    }

    // ─── 2. EVALUATE A SINGLE ANSWER ───────────────────────────────────────
    public String evaluateAnswer(
            String question,
            String topic,
            String userAnswer,
            String mode) {

        String prompt = buildEvaluationPrompt(
            question, topic, userAnswer, mode
        );
        return callGroq(prompt);
    }

    // ─── 3. GENERATE SESSION SUMMARY ───────────────────────────────────────
    public String generateSummary(String sessionTranscript) {
        String prompt = buildSummaryPrompt(sessionTranscript);
        return callGroq(prompt);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROMPT BUILDERS
    // ═══════════════════════════════════════════════════════════════════════

    private String buildQuestionPrompt(
            String resumeText,
            String jdText,
            String mode,
            String difficulty,
            String weakTopicsSummary,
            String previousQuestionsSummary) {

        String modeInstruction = mode.equals("HR")
            ? "Focus on behavioural questions, project discussion, career goals, " +
              "teamwork, and situational questions. Do NOT ask technical coding questions."
            : "Focus on technical questions — Java, OOP, DSA, SQL, DBMS, " +
              "OS, CN, Spring Boot, REST APIs. Match to the candidate's resume stack.";

        String difficultyInstruction = switch (difficulty) {
            case "BEGINNER"     ->
                "Ask fundamental conceptual questions. " +
                "Avoid complex algorithms or advanced framework internals.";
            case "ADVANCED"     ->
                "Ask deep questions — system design considerations, " +
                "internals, tradeoffs, edge cases. Assume strong fundamentals.";
            default             ->
                "Mix of conceptual and applied questions. " +
                "Test understanding, not just definitions.";
        };

        return """
            You are a professional technical interviewer conducting a %s interview.

            CANDIDATE RESUME:
            %s

            JOB DESCRIPTION:
            %s

            INTERVIEW TYPE: %s
            DIFFICULTY: %s

            INSTRUCTIONS:
            %s
            %s

            ADAPTIVE CONTEXT:
            %s
            %s

            TASK:
            Generate exactly 7 interview questions for this candidate.

            MANDATORY FORMATTING RULES:
            - Every question MUST contain highlighted technical keywords using **bold** (e.g., **Spring Boot**, **multithreading**, **indexing**, **connection pooling**).
            - Every question MUST wrap annotations, APIs, methods, data structures, and code identifiers with `backticks` (e.g., `@Valid`, `ConcurrentHashMap`, `Pageable`, `LEFT JOIN`).
            - Questions must specifically reference projects and technologies from the candidate's resume.
            - Do NOT repeat any previously asked questions listed above.
            - Emphasise weak topics listed above if any.
            - Return ONLY a valid JSON array. No explanations, no outer markdown wrappers.

            REQUIRED JSON FORMAT:
            [
              {
                "orderIndex": 1,
                "topic": "Spring Boot",
                "question": "In your **Smart Expense Tracker**, you used **Spring Boot** with `@Valid` annotations. How did you handle `MethodArgumentNotValidException` to return structured errors?"
              },
              {
                "orderIndex": 2,
                "topic": "JDBC",
                "question": "You refactored from raw **JDBC** to **Spring Data JPA**. Describe a scenario where plain **JDBC** is preferable, and how you manage **connection pooling** manually."
              }
            ]

            Topics must be one of: Java, OOP, DSA, SQL, DBMS, OS, CN,
            Spring Boot, REST APIs, JDBC, Projects, Behavioural
            """.formatted(
                mode, resumeText, jdText, mode, difficulty,
                modeInstruction, difficultyInstruction,
                weakTopicsSummary.isEmpty()
                    ? "No previous session data. Generate balanced questions."
                    : "WEAK TOPICS (emphasise these): " + weakTopicsSummary,
                previousQuestionsSummary.isEmpty()
                    ? ""
                    : "PREVIOUSLY ASKED (do NOT repeat): " + previousQuestionsSummary
            );
    }

    private String buildEvaluationPrompt(
            String question,
            String topic,
            String userAnswer,
            String mode) {

        return """
            You are an expert, encouraging technical interview mentor. Provide clear, pedagogical feedback in 2-4 sentences max.

            TOPIC: %s
            INTERVIEW MODE: %s

            QUESTION ASKED:
            %s

            CANDIDATE'S ANSWER:
            %s

            MANDATORY FORMATTING INSTRUCTIONS:
            - Format key concepts and important technical terms with **bold** (e.g., **thread-safe**, **lock-free reads**, **eviction policy**, **Pageable**).
            - Format code identifiers, annotations, class names, and SQL keywords with `backticks` (e.g., `@NotNull`, `ConcurrentHashMap`, `LIMIT/OFFSET`).

            FEEDBACK RULES FOR interviewerResponse:
            - Score 8-10: 1 sentence praise + 1 sentence senior-level pro tip with **bold** terms.
            - Score 5-7: 1 sentence validating what was right + 1-2 sentences explaining what was missing.
            - Score 0-4 (or blank/gibberish): In 2-3 clear, conversational sentences, explain the exact core answer directly using **bold** keywords and `code` identifiers so they learn the concept immediately.

            SCORING GUIDE:
            - 8-10: Strong answer.
            - 5-7:  Partial answer.
            - 0-4:  Incorrect, blank, or placeholder text.

            REQUIRED JSON FORMAT (Return ONLY raw valid JSON, no outer backticks):
            {
              "score": 2.0,
              "interviewerResponse": "Here's the core idea: Use `ConcurrentHashMap` for **thread-safe** operations because it provides **segmented locking** on writes while keeping reads non-blocking.",
              "whatWasGood": "Attempted question / acknowledged topic",
              "whatWasMissing": "Missing explanation of lock-free reads and custom eviction.",
              "aiFeedback": "Revise concurrency mechanics and in-memory caching trade-offs."
            }
            """.formatted(topic, mode, question, userAnswer);
    }

    private String buildSummaryPrompt(String sessionTranscript) {
        return """
            You are a professional interview coach reviewing a completed interview session.

            INTERVIEW TRANSCRIPT:
            %s

            Analyse the full interview and return ONLY valid JSON. No markdown wrappers, no backticks.

            REQUIRED JSON FORMAT:
            {
              "summaryParagraph": "2-3 sentence honest assessment of the candidate's performance.",
              "strengths": ["OOP", "Spring Boot"],
              "weakAreas": ["SQL", "DBMS"],
              "reviseBeforeNext": [
                "Practice INNER JOIN and LEFT JOIN with examples",
                "Revise ACID properties and transaction management",
                "Review process vs thread in OS"
              ]
            }

            RULES:
            - strengths and weakAreas must use topic names from the transcript.
            - reviseBeforeNext must be specific action items, not vague advice.
            - summaryParagraph must be honest — do not inflate performance.
            - Return ONLY the JSON object. Nothing else.
            """.formatted(sessionTranscript);
    }
}