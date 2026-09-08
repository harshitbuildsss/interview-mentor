package com.harshit.interviewmentor.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "user_answer", columnDefinition = "TEXT", nullable = false)
    private String userAnswer;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "interviewer_response", columnDefinition = "TEXT")
    private String interviewerResponse;

    @Column
    private Double score;

    @Column(name = "what_was_good", columnDefinition = "TEXT")
    private String whatWasGood;

    @Column(name = "what_was_missing", columnDefinition = "TEXT")
    private String whatWasMissing;
}