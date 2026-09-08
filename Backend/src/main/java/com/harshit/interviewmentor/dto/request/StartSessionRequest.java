package com.harshit.interviewmentor.dto.request;

import lombok.Data;

@Data
public class StartSessionRequest {
    private Integer userId;
    private Integer resumeId;
    private String  jdText;
    private String  mode;
    private String  difficulty;
}