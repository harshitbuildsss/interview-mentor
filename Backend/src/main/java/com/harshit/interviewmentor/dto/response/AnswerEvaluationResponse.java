package com.harshit.interviewmentor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnswerEvaluationResponse {
    private Integer answerId;
    private Double  score;
    private String  interviewerResponse;
    private String  whatWasGood;
    private String  whatWasMissing;
    private String  aiFeedback;
}