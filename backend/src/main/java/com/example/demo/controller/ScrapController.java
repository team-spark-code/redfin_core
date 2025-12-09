package com.example.demo.controller;

import com.example.demo.entity.Scrap;
import com.example.demo.service.ScrapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ScrapController {
    @Autowired
    private ScrapService scrapService;

    // ... (API methods for save and get scraps remain the same)

    // 스크랩 삭제 (API)
    @DeleteMapping("/api/scrap/{id}")
    public ResponseEntity<?> deleteScrap(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }
        String username = principal.getName();
        try {
            scrapService.deleteScrap(id, username);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting scrap: " + e.getMessage());
        }
    }

    // ... (Server-rendering methods remain the same)
    // 서버 렌더링: 스크랩 폼+목록
    @GetMapping("/scrap")
    public String scrapPage(Model model, Principal principal, @RequestParam(value = "success", required = false) String success, @RequestParam(value = "error", required = false) String error) {
        if (principal == null) {
            return "redirect:/login";
        }
        String username = principal.getName();
        model.addAttribute("scraps", scrapService.getScrapsByUsername(username));
        if (success != null) model.addAttribute("success", success);
        if (error != null) model.addAttribute("error", error);
        return "scrap";
    }

    // 서버 렌더링: 스크랩 저장
    @PostMapping("/scrap")
    public String saveScrap(@RequestParam("url") String url, Principal principal, Model model) {
        if (principal == null) {
            return "redirect:/login";
        }
        String username = principal.getName();
        if (url == null || url.isEmpty()) {
            model.addAttribute("error", "URL을 입력하세요.");
            model.addAttribute("scraps", scrapService.getScrapsByUsername(username));
            return "scrap";
        }
        try {
            scrapService.saveScrap(username, url);
            return "redirect:/"; // 스크랩 후 메인페이지로 리다이렉트
        } catch (Exception e) {
            model.addAttribute("error", "저장 실패: " + e.getMessage());
            model.addAttribute("scraps", scrapService.getScrapsByUsername(username));
            return "scrap";
        }
    }
}
