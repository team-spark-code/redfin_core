package com.example.demo.controller;

import com.example.demo.service.MemberJobService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/job-interest")
public class MemberJobController {
    private final MemberJobService memberJobService;

    public MemberJobController(MemberJobService memberJobService) {
        this.memberJobService = memberJobService;
    }

    // 직업 저장/수정
    @PostMapping
    public void saveJob(@RequestBody Map<String, String> body, Authentication authentication) {
        // 요청 본문에서 memberId가 있으면 사용, 없으면 userEmail로 찾기
        String memberIdStr = body.get("memberId");
        String userEmail = body.get("userEmail");
        String job = body.get("interest");

        if (memberIdStr != null && job != null) {
            // 멤버 ID를 직접 사용
            Long memberId = Long.parseLong(memberIdStr);
            memberJobService.saveOrUpdateJobByMemberId(memberId, job);
        } else if (userEmail != null && job != null) {
            // 이메일로 사용자 찾기 (기존 방식 호환)
            memberJobService.saveOrUpdateJob(userEmail, job);
        } else if (authentication != null && job != null) {
            // Authentication에서 사용자명 가져오기 (기존 방식)
            String username = authentication.getName();
            memberJobService.saveOrUpdateJob(username, job);
        }
    }

    // 직업 조회
    @GetMapping
    public Map<String, String> getJob(@RequestParam(required = false) String userEmail,
                                      @RequestParam(required = false) String memberId,
                                      Authentication authentication) {
        // 멤버 ID가 있으면 우선 사용
        if (memberId != null) {
            Long memberIdLong = Long.parseLong(memberId);
            return memberJobService.getJobByMemberId(memberIdLong)
                    .map(j -> Map.of("interest", j.getJob()))
                    .orElse(Map.of());
        }

        // 쿼리 파라미터에서 userEmail이 있으면 사용, 없으면 authentication에서 가져오기
        String username = userEmail;
        if (username == null && authentication != null) {
            username = authentication.getName();
        }

        if (username != null) {
            return memberJobService.getJobByUsername(username)
                    .map(j -> Map.of("interest", j.getJob()))
                    .orElse(Map.of());
        }

        return Map.of();
    }
}
