package com.harshit.interviewmentor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class SessionSummaryResponse {
    private Integer                  sessionId;
    private Double                   overallScore;
    private List<Map<String, Object>> topicScores;
    private List<String>             strengths;
    private List<String>             weakAreas;
    private String                   summaryParagraph;
    private List<String>             reviseBeforeNext;
}