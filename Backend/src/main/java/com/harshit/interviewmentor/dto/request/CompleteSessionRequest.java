package com.harshit.interviewmentor.dto.request;

import lombok.Data;

@Data
public class CompleteSessionRequest {
    private Integer sessionId;
    private Integer userId;
}