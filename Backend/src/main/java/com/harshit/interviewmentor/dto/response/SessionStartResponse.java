package com.harshit.interviewmentor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class SessionStartResponse {
    private Integer           sessionId;
    private String            mode;
    private String            difficulty;
    private List<QuestionDTO> questions;
}