package com.harshit.interviewmentor.controller;

import com.harshit.interviewmentor.model.Resume;
import com.harshit.interviewmentor.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @RequestParam("userId") Integer userId,
            @RequestParam("file") MultipartFile file) {

        Resume saved = resumeService.uploadResume(userId, file);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(Map.of(
                "resumeId",   saved.getId(),
                "fileName",   saved.getFileName(),
                "uploadedAt", saved.getUploadedAt().toString(),
                "extractedTextPreview",
                    saved.getExtractedText() != null
                        ? saved.getExtractedText().substring(
                            0, Math.min(200, saved.getExtractedText().length())
                          ) + "..."
                        : ""
            ));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getResumes(
            @PathVariable Integer userId) {

        List<Resume> resumes = resumeService.getResumesByUser(userId);

        List<Map<String, Object>> response = resumes.stream()
            .map(r -> Map.<String, Object>of(
                "resumeId",   r.getId(),
                "fileName",   r.getFileName(),
                "uploadedAt", r.getUploadedAt().toString()
            ))
            .toList();

        return ResponseEntity.ok(response);
    }
}