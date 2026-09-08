package com.harshit.interviewmentor.repository;

import com.harshit.interviewmentor.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Integer> {
    List<Resume> findByUserIdOrderByUploadedAtDesc(Integer userId);
}