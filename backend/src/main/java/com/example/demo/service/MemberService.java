package com.example.demo.service;

import com.example.demo.domain.Member;
import com.example.demo.dto.UserUpdateDto;
import com.example.demo.repository.jpa.MemberRepository;
import com.example.demo.repository.elasticsearch.MemberElasticsearchRepository;
import com.example.demo.dto.MemberForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final Optional<MemberElasticsearchRepository> memberElasticsearchRepository;

    public MemberService(MemberRepository memberRepository,
                        PasswordEncoder passwordEncoder,
                        @Autowired(required = false) MemberElasticsearchRepository memberElasticsearchRepository) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.memberElasticsearchRepository = Optional.ofNullable(memberElasticsearchRepository);
    }

    // ... (기존 메서드들은 그대로 유지) ...

    // 🔹 React 클라이언트용 사용자 정보 업데이트 메서드 추가
    @Transactional
    public Member updateUser(Long userId, UserUpdateDto userUpdateDto) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다. id=" + userId));

        // DTO의 정보로 Member 엔티티 업데이트
        member.setName(userUpdateDto.getName());
        member.setPhoneNumber(userUpdateDto.getPhone());
        member.setZipcode(userUpdateDto.getZipCode());
        member.setAddress(userUpdateDto.getAddress());
        member.setDetailAddress(userUpdateDto.getDetailAddress());
        // member.setBio(userUpdateDto.getBio()); // Member 엔티티에 bio 필드가 있다면 추가

        // 데이터베이스에 저장
        Member updatedMember = memberRepository.save(member);

        // Elasticsearch에도 변경사항 동기화
        memberElasticsearchRepository.ifPresent(repo -> repo.save(updatedMember));

        return updatedMember;
    }
    
    // 회원 가입
    @Transactional
    public Long join(Member member) {
        validateDuplicateMember(member);

        // 비밀번호 암호화
        member.setPassword(passwordEncoder.encode(member.getPassword()));

        Member savedMember = memberRepository.save(member);

        // Elasticsearch에도 저장 (있는 경우에만)
        memberElasticsearchRepository.ifPresent(repo -> repo.save(savedMember));

        return savedMember.getId();
    }

    // 중복 회원 검증
    private void validateDuplicateMember(Member member) {
        Member findMember = memberRepository.findByUsername(member.getUsername());
        if (findMember != null) {
            throw new IllegalStateException("이미 존재하는 회원입니다.");
        }

        Member findByEmail = memberRepository.findByEmail(member.getEmail());
        if (findByEmail != null) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }
    }

    // 회원 전체 조회
    public Page<Member> findMembers(Pageable pageable) {
        return memberRepository.findAll(pageable);
    }

    // ID로 회원 조회
    public Member findOne(Long memberId) {
        return memberRepository.findById(memberId).orElse(null);
    }

    // Username으로 회원 조회
    public Member findByUsername(String username) {
        return memberRepository.findByUsername(username);
    }

    // 이메일로 회원 조회
    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    // 이메일 존재 여부 확인 (React API용)
    public boolean existsByEmail(String email) {
        return memberRepository.findByEmail(email) != null;
    }

    // 회원 저장 (React API용)
    @Transactional
    public Member save(Member member) {
        Member savedMember = memberRepository.save(member);

        // Elasticsearch에도 저장 (있는 경우에만)
        memberElasticsearchRepository.ifPresent(repo -> repo.save(savedMember));

        return savedMember;
    }

    // 사용자명 중복 확인
    public boolean isUsernameExists(String username) {
        return memberRepository.findByUsername(username) != null;
    }

    // 이메일 중복 확인
    public boolean isEmailExists(String email) {
        return memberRepository.findByEmail(email) != null;
    }

    // 연관도 기반 회원 검색 - 개선된 다단계 검색 전략 사용
    public Page<Member> searchMembers(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return findMembers(pageable);
        }

        String trimmedKeyword = keyword.trim();

        // Elasticsearch가 사용 가능한 경우 사용
        if (memberElasticsearchRepository.isPresent()) {
            try {
                // 전화번호 패턴 검사 (숫자만 포함된 경우)
                if (trimmedKeyword.matches("\\d+")) {
                    Page<Member> phoneResults = memberElasticsearchRepository.get()
                        .findByPhoneNumber(trimmedKeyword, pageable);
                    if (!phoneResults.isEmpty()) {
                        return phoneResults;
                    }
                }

                // 1단계: 정확한 매칭 우선 검색 (완전 일치)
                Page<Member> exactResults = memberElasticsearchRepository.get()
                    .findByExactMatchWithHighRelevance(trimmedKeyword, pageable);
                if (!exactResults.isEmpty()) {
                    return exactResults;
                }

                // 2단계: 고도화된 연관도 검색 (부분 일치 포함)
                Page<Member> relevanceResults = memberElasticsearchRepository.get()
                    .findByKeywordWithHighRelevance(trimmedKeyword, pageable);
                if (!relevanceResults.isEmpty()) {
                    return relevanceResults;
                }

                // 3단계: 부분 매칭 및 유사도 검색
                Page<Member> fuzzyResults = memberElasticsearchRepository.get()
                    .findByFuzzySearchWithHighRelevance(trimmedKeyword, pageable);
                if (!fuzzyResults.isEmpty()) {
                    return fuzzyResults;
                }

                // 4단계: N-gram 기반 검색 (매우 유연한 검색)
                Page<Member> ngramResults = memberElasticsearchRepository.get()
                    .findByNgramSearch(trimmedKeyword, pageable);
                if (!ngramResults.isEmpty()) {
                    return ngramResults;
                }

            } catch (Exception e) {
                // Elasticsearch 오류 시 JPA fallback
                System.err.println("Elasticsearch 검색 중 오류 발생: " + e.getMessage());
                e.printStackTrace();
                return searchMembersWithJPA(trimmedKeyword, pageable);
            }
        }

        // Elasticsearch 없거나 결과 없으면 JPA 검색
        return searchMembersWithJPA(trimmedKeyword, pageable);
    }

    // JPA를 사용한 fallback 검색 - 키워드 기반 검색 추가
    private Page<Member> searchMembersWithJPA(String keyword, Pageable pageable) {
        // JPA를 사용한 기본 검색 - 이름, 사용자명, 이메일에서 키워드 검색
        if (keyword == null || keyword.trim().isEmpty()) {
            return memberRepository.findAll(pageable);
        }

        // JPA에서 기본적인 LIKE 검색 수행
        try {
            // 이름으로 검색
            Page<Member> nameResults = memberRepository.findByNameContainingIgnoreCase(keyword.trim(), pageable);
            if (!nameResults.isEmpty()) {
                return nameResults;
            }

            // 사용자명으로 검색
            Page<Member> usernameResults = memberRepository.findByUsernameContainingIgnoreCase(keyword.trim(), pageable);
            if (!usernameResults.isEmpty()) {
                return usernameResults;
            }

            // 이메일로 검색
            Page<Member> emailResults = memberRepository.findByEmailContainingIgnoreCase(keyword.trim(), pageable);
            if (!emailResults.isEmpty()) {
                return emailResults;
            }

        } catch (Exception e) {
            System.err.println("JPA 검색 중 오류 발생: " + e.getMessage());
        }

        // 검색 결과가 없으면 빈 페이지 반환 (전체 조회 대신)
        return Page.empty(pageable);
    }

    // 특정 검색 모드를 지정한 검색
    public Page<Member> searchMembersWithMode(String keyword, String searchMode, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return findMembers(pageable);
        }

        String trimmedKeyword = keyword.trim();

        if (memberElasticsearchRepository.isPresent()) {
            try {
                Page<Member> results = switch (searchMode.toLowerCase()) {
                    case "exact" -> memberElasticsearchRepository.get()
                        .findByExactMatchWithHighRelevance(trimmedKeyword, pageable);
                    case "fuzzy" -> memberElasticsearchRepository.get()
                        .findByFuzzySearchWithHighRelevance(trimmedKeyword, pageable);
                    case "ngram" -> memberElasticsearchRepository.get()
                        .findByNgramSearch(trimmedKeyword, pageable);
                    case "phone" -> memberElasticsearchRepository.get()
                        .findByPhoneNumber(trimmedKeyword, pageable);
                    default -> memberElasticsearchRepository.get()
                        .findByKeywordWithHighRelevance(trimmedKeyword, pageable);
                };

                // 검색 결과가 있으면 반환, 없으면 JPA fallback 사용
                if (!results.isEmpty()) {
                    return results;
                }

            } catch (Exception e) {
                System.err.println("Elasticsearch 검색 중 오류 발생: " + e.getMessage());
            }
        }

        // Elasticsearch가 없거나 결과가 없으면 JPA fallback 사용
        return searchMembersWithJPA(trimmedKeyword, pageable);
    }

    // JPA와 Elasticsearch 데이터 동기화
    @Transactional
    public void syncAllMembersToElasticsearch() {
        if (memberElasticsearchRepository.isPresent()) {
            List<Member> allMembers = memberRepository.findAll();
            memberElasticsearchRepository.get().saveAll(allMembers);
        }
    }

    // 프로필 업데이트
    @Transactional
    public void updateProfile(String username, MemberForm form) {
        Member member = memberRepository.findByUsername(username);
        if (member != null) {
            member.setName(form.getName());
            member.setEmail(form.getEmail());

            if (!form.getPassword().isEmpty()) {
                member.setPassword(passwordEncoder.encode(form.getPassword()));
            }

            String phoneNumber = form.getPhone1() + form.getPhone2() + form.getPhone3();
            member.setPhoneNumber(phoneNumber);
            member.setZipcode(form.getZipcode());
            member.setAddress(form.getAddress());
            member.setDetailAddress(form.getDetailAddress());

            // Elasticsearch에도 업데이트
            memberElasticsearchRepository.ifPresent(repo -> repo.save(member));
        }
    }

    // 사용자 관심사 조회
    public List<String> getMemberInterests(String username) {
        Member member = memberRepository.findByUsername(username);
        if (member != null) {
            return member.getInterests();
        }
        return List.of(); // 빈 리스트 반환
    }

    // 관심사 업데이트
    @Transactional
    public void updateMemberInterests(String username, List<String> interests) {
        Member member = memberRepository.findByUsername(username);
        if (member != null) {
            member.setInterests(interests);
            memberRepository.save(member);

            // Elasticsearch에도 업데이트
            memberElasticsearchRepository.ifPresent(repo -> repo.save(member));
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

    // 로그인 인증 메서드 추가
    public Member authenticate(String email, String password) {
        Member member = memberRepository.findByEmail(email);
        if (member != null && passwordEncoder.matches(password, member.getPassword())) {
            return member;
        }
        return null;
    }
}
