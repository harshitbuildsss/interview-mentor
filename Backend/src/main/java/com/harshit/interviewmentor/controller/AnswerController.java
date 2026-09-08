package com.harshit.interviewmentor.controller;

import com.harshit.interviewmentor.dto.request.CompleteSessionRequest;
import com.harshit.interviewmentor.dto.request.SubmitAnswerRequest;
import com.harshit.interviewmentor.dto.response.AnswerEvaluationResponse;
import com.harshit.interviewmentor.dto.response.SessionSummaryResponse;
import com.harshit.interviewmentor.service.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = "http://localhost:5173")
public class AnswerController {

    @Autowired
    private AnswerService answerService;

    @PostMapping("/submit")
    public ResponseEntity<AnswerEvaluationResponse> submitAnswer(
            @RequestBody SubmitAnswerRequest request) {
        return ResponseEntity.ok(answerService.submitAnswer(request));
    }

    @PostMapping("/complete-session")
    public ResponseEntity<SessionSummaryResponse> completeSession(
            @RequestBody CompleteSessionRequest request) {
        return ResponseEntity.ok(answerService.completeSession(request));
    }
}