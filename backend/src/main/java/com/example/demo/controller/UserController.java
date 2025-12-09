package com.example.demo.controller;

import com.example.demo.domain.Member;
import com.example.demo.dto.UserUpdateDto;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private MemberService memberService;

    // 현재 로그인한 사용자 정보 조회
    @GetMapping("/profile")
    public ResponseEntity<Member> getCurrentUserProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        return ResponseEntity.ok(userDetails.getMember());
    }

    // 사용자 정보 업데이트
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UserUpdateDto userUpdateDto) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }

        try {
            Long userId = userDetails.getMember().getId();
            Member updatedMember = memberService.updateUser(userId, userUpdateDto);
            return ResponseEntity.ok(updatedMember);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage());
        }
    }
}
