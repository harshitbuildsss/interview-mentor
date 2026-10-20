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

    private static final String GROQ_URL =
        "https://api.groq.com/openai/v1/chat/completions";

    private static final String MODEL = "openai/gpt-oss-20b";

    public GroqService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = new ObjectMapper();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CLEAN AI RESPONSE
    // ═══════════════════════════════════════════════════════════════════════

    private String cleanJsonResponse(String rawResponse) {

        if (rawResponse == null || rawResponse.isBlank()) {
            throw new RuntimeException(
                "Groq returned an empty response."
            );
        }

        String cleaned = rawResponse.trim();

        // Remove Markdown code fences if the AI includes them.
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(
                0,
                cleaned.length() - 3
            );
        }

        cleaned = cleaned.trim();

        if (cleaned.isBlank()) {
            throw new RuntimeException(
                "Groq returned an empty JSON response."
            );
        }

        return cleaned;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CALL GROQ API
    // ═══════════════════════════════════════════════════════════════════════

    private String callGroq(String prompt) {

        Map<String, Object> requestBody = Map.of(
            "model", MODEL,

            "messages", new Object[]{
                Map.of(
                    "role", "user",
                    "content", prompt
                )
            },

            "temperature", 0.2,

            // Request a JSON object instead of unrestricted text.
            "response_format", Map.of(
                "type", "json_object"
            )
        );

        String response = webClient.post()
            .uri(GROQ_URL)
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .bodyValue(requestBody)
            .retrieve()

            .onStatus(
                status ->
                    status.is4xxClientError()
                    || status.is5xxServerError(),

                clientResponse ->
                    clientResponse.bodyToMono(String.class)
                        .map(errorBody -> new RuntimeException(
                            "Groq API error "
                                + clientResponse.statusCode()
                                + ": "
                                + errorBody
                        ))
            )

            .bodyToMono(String.class)
            .block();

        if (response == null || response.isBlank()) {
            throw new RuntimeException(
                "Groq API returned an empty response."
            );
        }

        try {

            JsonNode root = objectMapper.readTree(response);

            // Check whether Groq returned an API error object.
            if (root.has("error")) {
                throw new RuntimeException(
                    "Groq API error: "
                        + root.path("error").toString()
                );
            }

            JsonNode choices = root.path("choices");

            if (!choices.isArray() || choices.isEmpty()) {
                throw new RuntimeException(
                    "Groq response contains no choices: " + response
                );
            }

            JsonNode message = choices
                .get(0)
                .path("message");

            String rawContent = message
                .path("content")
                .asText("");

            if (rawContent.isBlank()) {
                throw new RuntimeException(
                    "Groq returned no message content. Response: "
                        + response
                );
            }

            return cleanJsonResponse(rawContent);

        } catch (Exception e) {

            throw new RuntimeException(
                "Failed to process Groq response: "
                    + e.getMessage(),
                e
            );
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 1. GENERATE INTERVIEW QUESTIONS
    // ═══════════════════════════════════════════════════════════════════════

    public String generateQuestions(
            String resumeText,
            String jdText,
            String mode,
            String difficulty,
            String weakTopicsSummary,
            String previousQuestionsSummary) {

        String prompt = buildQuestionPrompt(
            resumeText,
            jdText,
            mode,
            difficulty,
            weakTopicsSummary,
            previousQuestionsSummary
        );

        return callGroq(prompt);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. EVALUATE A SINGLE ANSWER
    // ═══════════════════════════════════════════════════════════════════════

    public String evaluateAnswer(
            String question,
            String topic,
            String userAnswer,
            String mode) {

        String prompt = buildEvaluationPrompt(
            question,
            topic,
            userAnswer,
            mode
        );

        return callGroq(prompt);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. GENERATE SESSION SUMMARY
    // ═══════════════════════════════════════════════════════════════════════

    public String generateSummary(String sessionTranscript) {

        String prompt = buildSummaryPrompt(sessionTranscript);

        return callGroq(prompt);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROMPT BUILDERS
    // ═══════════════════════════════════════════════════════════════════════

    // ─── QUESTION GENERATION PROMPT ────────────────────────────────────────

    private String buildQuestionPrompt(
            String resumeText,
            String jdText,
            String mode,
            String difficulty,
            String weakTopicsSummary,
            String previousQuestionsSummary) {

        String modeInstruction = "HR".equalsIgnoreCase(mode)
            ? """
              Focus on behavioural questions, project discussion,
              career goals, teamwork, and situational questions.
              Do NOT ask technical coding questions.
              """
            : """
              Focus on technical questions covering Java, OOP, DSA,
              SQL, DBMS, OS, CN, Spring Boot, and REST APIs.
              Match the questions to the candidate's resume and
              the technologies relevant to the job description.
              """;

        String difficultyInstruction = switch (difficulty) {

            case "BEGINNER" ->
                """
                Ask fundamental conceptual questions.
                Avoid complex algorithms and advanced framework internals.
                """;

            case "ADVANCED" ->
                """
                Ask in-depth questions about system design, internals,
                trade-offs, edge cases, and practical implementation.
                Assume the candidate has strong fundamentals.
                """;

            default ->
                """
                Mix conceptual and applied questions.
                Test understanding rather than memorization.
                """;
        };

        String weakTopicsInstruction =
            weakTopicsSummary == null || weakTopicsSummary.isBlank()
                ? "No previous session data. Generate balanced questions."
                : "WEAK TOPICS TO EMPHASIZE: " + weakTopicsSummary;

        String previousQuestionsInstruction =
            previousQuestionsSummary == null
                || previousQuestionsSummary.isBlank()
                ? "No previous questions are available."
                : "PREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT): "
                    + previousQuestionsSummary;

        return """
            You are a professional interviewer conducting a %s interview.

            CANDIDATE RESUME:
            %s

            JOB DESCRIPTION:
            %s

            INTERVIEW TYPE: %s
            DIFFICULTY: %s

            INTERVIEW INSTRUCTIONS:
            %s

            DIFFICULTY INSTRUCTIONS:
            %s

            ADAPTIVE CONTEXT:
            %s

            %s

            TASK:
            Generate exactly 7 interview questions for this candidate.

            QUESTION REQUIREMENTS:

            1. Every question must contain relevant technical keywords
               highlighted using Markdown bold formatting, such as
               **Spring Boot**, **multithreading**, and **indexing**.

            2. Wrap annotations, APIs, methods, data structures, class
               names, and code identifiers in backticks, such as
               `@Valid`, `ConcurrentHashMap`, and `LEFT JOIN`.

            3. Questions must be relevant to the candidate's resume,
               projects, skills, or the supplied job description.

            4. Do not invent projects or claim that the candidate used
               technologies that are not supported by the supplied context.

            5. Do not repeat previously asked questions.

            6. Emphasize weak topics when previous performance data exists.

            7. Use the selected difficulty level consistently.

            8. Each question must have a meaningful topic.

            9. Assign orderIndex values from 1 through 7.

            10. The question field must contain the complete interview
                question as a string.

            ALLOWED TOPICS:
            Java, OOP, DSA, SQL, DBMS, OS, CN, Spring Boot,
            REST APIs, JDBC, Projects, Behavioural

            STRICT OUTPUT REQUIREMENTS:

            Return ONLY a valid JSON object.
            The object MUST contain a property named "questions".
            The value of "questions" MUST be an array containing
            exactly 7 question objects.

            Do not include Markdown code fences.
            Do not include explanations outside the JSON object.
            Do not return a JSON array as the top-level value.

            REQUIRED JSON STRUCTURE:

            {
              "questions": [
                {
                  "orderIndex": 1,
                  "topic": "Java",
                  "question": "Explain **OOP** and its four pillars."
                },
                {
                  "orderIndex": 2,
                  "topic": "SQL",
                  "question": "Explain the difference between `INNER JOIN` and `LEFT JOIN`."
                }
              ]
            }

            The example illustrates the required structure.
            Your actual response must contain exactly 7 questions.
            """.formatted(
                mode,
                resumeText == null ? "" : resumeText,
                jdText == null || jdText.isBlank()
                    ? "No job description provided."
                    : jdText,
                mode,
                difficulty,
                modeInstruction,
                difficultyInstruction,
                weakTopicsInstruction,
                previousQuestionsInstruction
            );
    }

    // ─── ANSWER EVALUATION PROMPT ──────────────────────────────────────────

    private String buildEvaluationPrompt(
            String question,
            String topic,
            String userAnswer,
            String mode) {

        return """
            You are an expert and encouraging technical interview mentor.

            Evaluate the candidate's answer honestly and constructively.
            Provide clear feedback that helps the candidate understand
            the correct answer and improve their interview performance.

            TOPIC: %s

            INTERVIEW MODE: %s

            QUESTION ASKED:
            %s

            CANDIDATE'S ANSWER:
            %s

            FORMATTING REQUIREMENTS:

            - Format important technical terms using Markdown bold,
              such as **thread-safe** and **database indexing**.
            - Format code identifiers, annotations, class names, and
              SQL keywords using backticks, such as `@NotNull`,
              `ConcurrentHashMap`, and `LIMIT/OFFSET`.

            SCORING GUIDE:

            8-10: Strong answer demonstrating clear understanding.
            5-7: Partially correct answer with some missing details.
            0-4: Incorrect, incomplete, blank, or irrelevant answer.

            FEEDBACK RULES:

            - For scores from 8 to 10, acknowledge the strong answer
              and provide a useful advanced tip.
            - For scores from 5 to 7, identify what was correct and
              explain the important missing details.
            - For scores from 0 to 4, explain the core concept directly
              and show what a correct answer should cover.
            - Keep interviewerResponse to 2-4 sentences.
            - Do not give inflated scores for incorrect answers.
            - Base the evaluation on the actual question and answer.

            STRICT OUTPUT REQUIREMENTS:

            Return ONLY a valid JSON object.
            Do not include Markdown code fences or additional text.

            REQUIRED JSON FORMAT:

            {
              "score": 2.0,
              "interviewerResponse": "Explain the core concept and provide useful feedback.",
              "whatWasGood": "Identify what the candidate did correctly.",
              "whatWasMissing": "Identify the important missing concepts.",
              "aiFeedback": "Give a specific recommendation for improvement."
            }

            The score must be a number between 0 and 10.
            All four feedback fields must be strings.
            """.formatted(
                topic == null ? "" : topic,
                mode == null ? "" : mode,
                question == null ? "" : question,
                userAnswer == null ? "" : userAnswer
            );
    }

    // ─── SESSION SUMMARY PROMPT ────────────────────────────────────────────

    private String buildSummaryPrompt(String sessionTranscript) {

        return """
            You are a professional interview coach reviewing a completed
            interview session.

            INTERVIEW TRANSCRIPT:
            %s

            Analyse the full interview and provide an honest assessment
            of the candidate's performance.

            SUMMARY REQUIREMENTS:

            1. Write summaryParagraph in 2-3 sentences.
            2. Identify strengths demonstrated in the transcript.
            3. Identify weak areas that need improvement.
            4. Provide specific revision actions rather than vague advice.
            5. Use topic names supported by the interview transcript.
            6. Do not exaggerate the candidate's performance.
            7. Do not invent answers or topics that were not discussed.

            STRICT OUTPUT REQUIREMENTS:

            Return ONLY a valid JSON object.
            Do not include Markdown code fences or additional text.

            REQUIRED JSON FORMAT:

            {
              "summaryParagraph": "An honest 2-3 sentence assessment.",
              "strengths": [
                "OOP",
                "Spring Boot"
              ],
              "weakAreas": [
                "SQL",
                "DBMS"
              ],
              "reviseBeforeNext": [
                "Practise INNER JOIN and LEFT JOIN with examples.",
                "Revise ACID properties and transaction management.",
                "Review the difference between processes and threads."
              ]
            }

            strengths and weakAreas must be JSON arrays of strings.
            reviseBeforeNext must be a JSON array of specific actions.
            summaryParagraph must be a string.
            """.formatted(
                sessionTranscript == null ? "" : sessionTranscript
            );
    }
}