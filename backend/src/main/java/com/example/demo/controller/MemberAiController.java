package com.example.demo.controller;

import com.example.demo.service.MemberAiService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-company")
public class MemberAiController {
    private final MemberAiService memberAiService;

    public MemberAiController(MemberAiService memberAiService) {
        this.memberAiService = memberAiService;
    }

    // AI기업 저장/수정
    @PostMapping
    public void saveAiCompany(@RequestBody Map<String, String> body, Authentication authentication) {
        // 요청 본문에서 memberId가 있으면 사용, 없으면 userEmail로 찾기
        String memberIdStr = body.get("memberId");
        String userEmail = body.get("userEmail");
        String aiCompany = body.get("aiCompany");

        if (memberIdStr != null && aiCompany != null) {
            // 멤버 ID를 직접 사용
            Long memberId = Long.parseLong(memberIdStr);
            memberAiService.saveOrUpdateAiCompanyByMemberId(memberId, aiCompany);
        } else if (userEmail != null && aiCompany != null) {
            // 이메일로 사용자 찾기 (기존 방식 호환)
            memberAiService.saveOrUpdateAiCompany(userEmail, aiCompany);
        } else if (authentication != null && aiCompany != null) {
            // Authentication에서 사용자명 가져오기 (기존 방식)
            String username = authentication.getName();
            memberAiService.saveOrUpdateAiCompany(username, aiCompany);
        }
    }

    // AI기업 조회
    @GetMapping
    public Map<String, String> getAiCompany(@RequestParam(required = false) String userEmail,
                                           @RequestParam(required = false) String memberId,
                                           Authentication authentication) {
        // 멤버 ID가 있으면 우선 사용
        if (memberId != null) {
            Long memberIdLong = Long.parseLong(memberId);
            return memberAiService.getAiCompanyByMemberId(memberIdLong)
                    .map(ai -> Map.of("aiCompany", ai.getAiCompany()))
                    .orElse(Map.of());
        }

        // 쿼리 파라미터에서 userEmail이 있으면 사용, 없으면 authentication에서 가져오기
        String username = userEmail;
        if (username == null && authentication != null) {
            username = authentication.getName();
        }

        if (username != null) {
            return memberAiService.getAiCompanyByUsername(username)
                    .map(ai -> Map.of("aiCompany", ai.getAiCompany()))
                    .orElse(Map.of());
        }

        return Map.of();
    }
}
