package com.harshit.interviewmentor.service;

import com.harshit.interviewmentor.exception.ResourceNotFoundException;
import com.harshit.interviewmentor.model.Resume;
import com.harshit.interviewmentor.model.User;
import com.harshit.interviewmentor.repository.ResumeRepository;
import com.harshit.interviewmentor.repository.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.Loader;
import java.io.IOException;
import java.util.List;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    public Resume uploadResume(Integer userId, MultipartFile file) {

        // Validate file type
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are accepted.");
        }

        // Extract text from PDF using PDFBox
        String extractedText;
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());
            PDFTextStripper stripper = new PDFTextStripper();
            extractedText = stripper.getText(document);
            document.close();
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not read PDF file. Make sure it is not corrupted.");
        }

        // Validate extraction result
        if (extractedText == null || extractedText.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "No text could be extracted from this PDF. " +
                "Make sure it is not a scanned image-only document."
            );
        }

        // Fetch user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        // Build and save resume
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFileName(filename);
        resume.setExtractedText(extractedText.trim());

        return resumeRepository.save(resume);
    }

    public List<Resume> getResumesByUser(Integer userId) {
        return resumeRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }

    public Resume getResumeById(Integer resumeId) {
        return resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ResourceNotFoundException("Resume not found."));
    }
}