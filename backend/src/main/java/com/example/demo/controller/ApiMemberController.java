package com.example.demo.controller;

import com.example.demo.config.CustomAuditorAware;
import com.example.demo.domain.Member;
import com.example.demo.dto.MemberForm;
import com.example.demo.dto.SignupRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.service.MemberService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApiMemberController {

    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody SignupRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 이메일 중복 체크
            if (memberService.existsByEmail(request.getEmail())) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 이메일입니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 회원 생성
            Member member = new Member();
            member.setUsername(request.getEmail()); // 이메일을 username으로 사용
            member.setName(request.getFullName());
            member.setPassword(passwordEncoder.encode(request.getPassword()));
            member.setEmail(request.getEmail());
            member.setPhoneNumber(request.getPhoneNumber());

            // CustomAuditorAware 설정
            CustomAuditorAware.setAuditor(request.getEmail());

            Member savedMember = memberService.save(member);

            response.put("success", true);
            response.put("message", "회원가입이 완료되었습니다.");
            response.put("memberId", savedMember.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "회원가입 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        boolean exists = memberService.existsByEmail(email);
        response.put("exists", exists);
        response.put("message", exists ? "이미 사용 중인 이메일입니다." : "사용 가능한 이메일입니다.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 이메일과 비밀번호로 인증
            Member member = memberService.authenticate(request.getEmail(), request.getPassword());

            if (member != null) {
                response.put("success", true);
                response.put("message", "로그인이 완료되었습니다.");
                response.put("memberId", member.getId());
                response.put("email", member.getEmail());
                response.put("name", member.getName());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이메일 또는 비밀번호가 올바르지 ��습니다.");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "로그인 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
