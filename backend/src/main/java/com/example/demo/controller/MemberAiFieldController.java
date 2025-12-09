package com.example.demo.controller;

import com.example.demo.service.MemberAiFieldService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-field")
public class MemberAiFieldController {
    private final MemberAiFieldService memberAiFieldService;

    public MemberAiFieldController(MemberAiFieldService memberAiFieldService) {
        this.memberAiFieldService = memberAiFieldService;
    }

    // 관심분야 저장/수정
    @PostMapping
    public void saveAiField(@RequestBody Map<String, String> body, Authentication authentication) {
        // 요청 본문에서 memberId가 있으면 사용, 없으면 userEmail로 찾기
        String memberIdStr = body.get("memberId");
        String userEmail = body.get("userEmail");
        String aiField = body.get("aiField");

        if (memberIdStr != null && aiField != null) {
            // 멤버 ID를 직접 사용
            Long memberId = Long.parseLong(memberIdStr);
            memberAiFieldService.saveOrUpdateAiFieldByMemberId(memberId, aiField);
        } else if (userEmail != null && aiField != null) {
            // 이메일로 사용자 찾기 (기존 방식 호환)
            memberAiFieldService.saveOrUpdateAiField(userEmail, aiField);
        } else if (authentication != null && aiField != null) {
            // Authentication에서 사용자명 가져오기 (기존 방식)
            String username = authentication.getName();
            memberAiFieldService.saveOrUpdateAiField(username, aiField);
        }
    }

    // 관심분야 조회
    @GetMapping
    public Map<String, String> getAiField(@RequestParam(required = false) String userEmail,
                                         @RequestParam(required = false) String memberId,
                                         Authentication authentication) {
        // 멤버 ID가 있으면 우선 사용
        if (memberId != null) {
            Long memberIdLong = Long.parseLong(memberId);
            return memberAiFieldService.getAiFieldByMemberId(memberIdLong)
                    .map(field -> Map.of("aiField", field.getAiField()))
                    .orElse(Map.of());
        }

        // 쿼리 파라미터에서 userEmail이 있으면 사용, 없으면 authentication에서 가져오기
        String username = userEmail;
        if (username == null && authentication != null) {
            username = authentication.getName();
        }

        if (username != null) {
            return memberAiFieldService.getAiFieldByUsername(username)
                    .map(field -> Map.of("aiField", field.getAiField()))
                    .orElse(Map.of());
        }

        return Map.of();
    }
}
