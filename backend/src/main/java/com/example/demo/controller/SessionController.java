package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SessionController {

    /**
     * 세션 상태 확인 API
     */
    @GetMapping("/session-status")
    public ResponseEntity<Map<String, Object>> checkSessionStatus(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            HttpSession session = request.getSession(false);

            if (auth != null && auth.isAuthenticated() &&
                !auth.getName().equals("anonymousUser") && session != null) {

                // 세션 정보
                response.put("authenticated", true);
                response.put("username", auth.getName());
                response.put("sessionId", session.getId());
                response.put("maxInactiveInterval", session.getMaxInactiveInterval());
                response.put("creationTime", session.getCreationTime());
                response.put("lastAccessedTime", session.getLastAccessedTime());

                return ResponseEntity.ok(response);
            } else {
                response.put("authenticated", false);
                response.put("message", "세션이 만료되었습니다.");
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            response.put("authenticated", false);
            response.put("message", "세션 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 세션 연장 API
     */
    @PostMapping("/extend-session")
    public ResponseEntity<Map<String, String>> extendSession(HttpServletRequest request) {
        Map<String, String> response = new HashMap<>();

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            HttpSession session = request.getSession(false);

            if (auth != null && auth.isAuthenticated() &&
                !auth.getName().equals("anonymousUser") && session != null) {

                // 세션 연장 (새로운 세션 생성)
                session.setMaxInactiveInterval(300); // 5분으로 재설정

                response.put("status", "success");
                response.put("message", "세션이 성공적으로 연장되었습니다.");
                response.put("username", auth.getName());
                response.put("extendedTime", String.valueOf(System.currentTimeMillis()));

                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "유효하지 않은 세션입니다.");
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "세션 연장 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
}
