package com.example.demo.service;

import com.example.demo.domain.Member;
import com.example.demo.domain.MemberAi;
import com.example.demo.repository.jpa.MemberAiRepository;
import com.example.demo.repository.jpa.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class MemberAiService {
    private final MemberAiRepository memberAiRepository;
    private final MemberRepository memberRepository;

    public MemberAiService(MemberAiRepository memberAiRepository, MemberRepository memberRepository) {
        this.memberAiRepository = memberAiRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public void saveOrUpdateAiCompany(String username, String aiCompany) {
        Member member = memberRepository.findByUsername(username);
        if (member == null) throw new IllegalArgumentException("회원이 존재하지 않습니다.");
        Optional<MemberAi> existing = memberAiRepository.findByMember(member);
        if (existing.isPresent()) {
            MemberAi ai = existing.get();
            ai.setAiCompany(aiCompany);
            memberAiRepository.save(ai);
        } else {
            MemberAi ai = new MemberAi(member, aiCompany);
            memberAiRepository.save(ai);
        }
    }

    public Optional<MemberAi> getAiCompanyByUsername(String username) {
        Member member = memberRepository.findByUsername(username);
        if (member == null) return Optional.empty();
        return memberAiRepository.findByMember(member);
    }

    // 멤버 ID로 AI 기업 정보 저장/수정하는 새 메서드 추가
    @Transactional
    public void saveOrUpdateAiCompanyByMemberId(Long memberId, String aiCompany) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));
        Optional<MemberAi> existing = memberAiRepository.findByMember(member);
        if (existing.isPresent()) {
            MemberAi ai = existing.get();
            ai.setAiCompany(aiCompany);
            memberAiRepository.save(ai);
        } else {
            MemberAi ai = new MemberAi(member, aiCompany);
            memberAiRepository.save(ai);
        }
    }

    // 멤버 ID로 AI 기업 정보 조회하는 새 메서드 추가
    public Optional<MemberAi> getAiCompanyByMemberId(Long memberId) {
        Member member = memberRepository.findById(memberId).orElse(null);
        if (member == null) return Optional.empty();
        return memberAiRepository.findByMember(member);
    }
}
