package com.harshit.interviewmentor.dto.request;

import lombok.Data;

@Data
public class SubmitAnswerRequest {
    private Integer questionId;
    private Integer sessionId;
    private String  userAnswer;
}