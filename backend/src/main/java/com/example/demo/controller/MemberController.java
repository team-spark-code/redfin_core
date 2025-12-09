package com.example.demo.controller;

import com.example.demo.config.CustomAuditorAware;
import com.example.demo.domain.Member;
import com.example.demo.dto.MemberForm;
import com.example.demo.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/signup")
    public String signupForm(Model model) {
        model.addAttribute("memberForm", new MemberForm());
        return "signup";
    }

    @PostMapping("/signup")
    public String signup(MemberForm form, Model model) {
        if (!form.getPassword().equals(form.getPasswordConfirm())) {
            model.addAttribute("memberForm", form);
            model.addAttribute("errorMessage", "비밀번호가 일치하지 않습니다.");
            return "signup";
        }
        try {
            CustomAuditorAware.setAuditor(form.getUsername());
            Member member = new Member();
            member.setUsername(form.getUsername());
            member.setName(form.getName());
            member.setPassword(form.getPassword());
            member.setPasswordConfirm(form.getPasswordConfirm());
            member.setEmail(form.getEmail());

            // 전화번호 필드를 하나로 합쳐서 설정
            String phoneNumber = form.getPhone1() + form.getPhone2() + form.getPhone3();
            member.setPhoneNumber(phoneNumber);

            member.setZipcode(form.getZipcode());
            member.setAddress(form.getAddress());
            member.setDetailAddress(form.getDetailAddress());
            memberService.join(member);

            // 회원가입 성공 후 관심사 선택 페이지로 리다이렉트
            return "redirect:/interests";
        } catch (IllegalStateException e) {
            model.addAttribute("memberForm", form);
            model.addAttribute("errorMessage", e.getMessage());
            return "signup";
        } finally {
            CustomAuditorAware.clear();
        }
    }

    @GetMapping("/api/check-username")
    @ResponseBody
    public String checkUsername(@RequestParam String username) {
        boolean exists = memberService.isUsernameExists(username);
        return exists ? "duplicate" : "ok";
    }

    @GetMapping("/members")
    public String list(@RequestParam(value = "page", defaultValue = "0") int page,
                      @RequestParam(value = "keyword", required = false) String keyword,
                      @RequestParam(value = "searchMode", defaultValue = "standard") String searchMode,
                      Model model) {
        int pageSize = 10; // 페이지 크기 증가로 더 많은 결과 표시
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Member> memberPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            // 개선된 검색 로직 사용
            memberPage = memberService.searchMembers(keyword, pageable);
            model.addAttribute("searchResultCount", memberPage.getTotalElements());
            model.addAttribute("searchKeyword", keyword.trim());
        } else {
            memberPage = memberService.findMembers(pageable);
        }

        model.addAttribute("members", memberPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", memberPage.getTotalPages());
        model.addAttribute("totalElements", memberPage.getTotalElements());
        model.addAttribute("hasPrev", memberPage.hasPrevious());
        model.addAttribute("hasNext", memberPage.hasNext());
        model.addAttribute("keyword", keyword);
        model.addAttribute("searchMode", searchMode);

        // 검색 모드 옵션 제공
        model.addAttribute("searchModes", Map.of(
            "standard", "표준 검색",
            "exact", "정확한 일치",
            "fuzzy", "유사도 검색",
            "ngram", "부분 문자열",
            "phone", "전화번호"
        ));

        return "members";
    }

    @GetMapping("/profile")
    public String profileForm(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Member member = memberService.findByUsername(username);
        MemberForm form = new MemberForm();
        form.setUsername(member.getUsername());
        form.setName(member.getName());
        form.setEmail(member.getEmail());
        if (member.getPhoneNumber() != null && member.getPhoneNumber().length() == 11) {
            form.setPhone1(member.getPhoneNumber().substring(0, 3));
            form.setPhone2(member.getPhoneNumber().substring(3, 7));
            form.setPhone3(member.getPhoneNumber().substring(7));
        }
        form.setZipcode(member.getZipcode());
        form.setAddress(member.getAddress());
        form.setDetailAddress(member.getDetailAddress());
        model.addAttribute("memberForm", form);
        return "profile";
    }

    @PostMapping("/profile")
    public String updateProfile(MemberForm form, Model model) {
        if (!form.getPassword().isEmpty() && !form.getPassword().equals(form.getPasswordConfirm())) {
            model.addAttribute("memberForm", form);
            model.addAttribute("errorMessage", "비밀번호가 일치하지 않습니다.");
            return "profile";
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        memberService.updateProfile(username, form);
        return "redirect:/";
    }

    // 관심사 선택 페이지
    @GetMapping("/interests")
    public String interestsPage(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName().equals("anonymousUser")) {
            return "redirect:/login";
        }
        return "interests";
    }

    // 직업 관심사 선택 페이지 (새로 추가)
    @GetMapping("/job-interests")
    public String jobInterestsPage(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName().equals("anonymousUser")) {
            return "redirect:/login";
        }
        return "job-interests";
    }

    // 관심사 업데이트 API
    @PostMapping("/api/interests")
    @ResponseBody
    public ResponseEntity<Map<String, String>> updateInterests(@RequestBody List<String> interests) {
        Map<String, String> response = new HashMap<>();
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            // 관심사 저장 로직 (Member 도메인에 interests 필드가 있다면 저장)
            memberService.updateMemberInterests(username, interests);

            response.put("status", "success");
            response.put("message", "관심사가 성공적으로 저장되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "관심사 저장에 실패했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 사용자 관심사 조회 API
    @GetMapping("/api/interests")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getUserInterests() {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            List<String> userInterests = memberService.getMemberInterests(username);
            response.put("status", "success");
            response.put("interests", userInterests);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "관심사 조회에 실패했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Elasticsearch 동기화 엔드포인트
    @PostMapping("/members/sync")
    @ResponseBody
    public ResponseEntity<Map<String, String>> syncMembersToElasticsearch() {
        try {
            memberService.syncAllMembersToElasticsearch();
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "회원 데이터가 엘라스틱서치에 동기화되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "동기화 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // API: 고급 검색 (AJAX용)
    @GetMapping("/api/members/search")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchMembersApi(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "searchMode", defaultValue = "standard") String searchMode,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Member> memberPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            memberPage = memberService.searchMembersWithMode(keyword, searchMode, pageable);
        } else {
            memberPage = memberService.findMembers(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("members", memberPage.getContent());
        response.put("totalElements", memberPage.getTotalElements());
        response.put("totalPages", memberPage.getTotalPages());
        response.put("currentPage", page);
        response.put("hasNext", memberPage.hasNext());
        response.put("hasPrev", memberPage.hasPrevious());
        response.put("searchKeyword", keyword);
        response.put("searchMode", searchMode);

        return ResponseEntity.ok(response);
    }

    // 엘라스틱 서치 인덱스 동기화 API
    @PostMapping("/api/elasticsearch/sync")
    @ResponseBody
    public ResponseEntity<Map<String, String>> syncElasticsearchIndex() {
        try {
            memberService.syncAllMembersToElasticsearch();
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "엘라스틱 서치 인덱스 동기화가 완료되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "동기화 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 검색 정확도 테스트 API
    @GetMapping("/api/elasticsearch/test")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> testElasticsearchAccuracy(
            @RequestParam String keyword) {

        Map<String, Object> testResults = new HashMap<>();
        Pageable pageable = PageRequest.of(0, 5);

        try {
            // 각 검색 모드별 결과 테스트
            Page<Member> exactResults = memberService.searchMembersWithMode(keyword, "exact", pageable);
            Page<Member> fuzzyResults = memberService.searchMembersWithMode(keyword, "fuzzy", pageable);
            Page<Member> ngramResults = memberService.searchMembersWithMode(keyword, "ngram", pageable);
            Page<Member> standardResults = memberService.searchMembersWithMode(keyword, "standard", pageable);

            testResults.put("keyword", keyword);
            testResults.put("exactMatch", Map.of(
                "count", exactResults.getTotalElements(),
                "results", exactResults.getContent()
            ));
            testResults.put("fuzzySearch", Map.of(
                "count", fuzzyResults.getTotalElements(),
                "results", fuzzyResults.getContent()
            ));
            testResults.put("ngramSearch", Map.of(
                "count", ngramResults.getTotalElements(),
                "results", ngramResults.getContent()
            ));
            testResults.put("standardSearch", Map.of(
                "count", standardResults.getTotalElements(),
                "results", standardResults.getContent()
            ));

            return ResponseEntity.ok(testResults);

        } catch (Exception e) {
            testResults.put("error", e.getMessage());
            return ResponseEntity.status(500).body(testResults);
        }
    }
}
