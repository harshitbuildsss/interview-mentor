package com.harshit.interviewmentor.service;

import java.util.Map;
import com.harshit.interviewmentor.dto.request.LoginRequest;
import com.harshit.interviewmentor.dto.request.RegisterRequest;
import com.harshit.interviewmentor.dto.response.LoginResponse;
import com.harshit.interviewmentor.model.User;
import com.harshit.interviewmentor.repository.UserRepository;
import com.harshit.interviewmentor.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> register(RegisterRequest request) {
        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Build user — hash password before saving
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);

        return Map.of(
            "message", "Account created successfully",
            "userId", saved.getId()
        );
    }

    public LoginResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        // Compare hashed passwords
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return new LoginResponse(token, user.getId(), user.getName());
    }
}