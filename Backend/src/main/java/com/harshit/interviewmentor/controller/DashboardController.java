package com.harshit.interviewmentor.controller;

import com.harshit.interviewmentor.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(dashboardService.getDashboard(userId));
    }
}