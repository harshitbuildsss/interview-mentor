package com.harshit.interviewmentor.controller;

import com.harshit.interviewmentor.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(
            Authentication authentication) {

        Integer authenticatedUserId =
            (Integer) authentication.getPrincipal();

        return ResponseEntity.ok(
            dashboardService.getDashboard(authenticatedUserId)
        );
    }
}