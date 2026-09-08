package com.harshit.interviewmentor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuestionDTO {
    private Integer id;
    private Integer orderIndex;
    private String  topic;
    private String  question;
}