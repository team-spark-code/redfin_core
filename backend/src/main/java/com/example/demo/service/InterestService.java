package com.example.demo.service;

import com.example.demo.domain.Interest;
import com.example.demo.domain.Member;
import com.example.demo.repository.jpa.InterestRepository;
import com.example.demo.repository.jpa.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class InterestService {
    private final InterestRepository interestRepository;
    private final MemberRepository memberRepository;

    public InterestService(InterestRepository interestRepository, MemberRepository memberRepository) {
        this.interestRepository = interestRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public void saveOrUpdateInterest(String username, String interest) {
        Member member = memberRepository.findByUsername(username);
        if (member == null) throw new IllegalArgumentException("회원이 존재하지 않습니다.");
        Optional<Interest> existing = interestRepository.findByMember(member);
        if (existing.isPresent()) {
            Interest i = existing.get();
            i.setInterest(interest);
            interestRepository.save(i);
        } else {
            Interest i = new Interest(member, interest);
            interestRepository.save(i);
        }
    }

    public Optional<Interest> getInterestByUsername(String username) {
        Member member = memberRepository.findByUsername(username);
        if (member == null) return Optional.empty();
        return interestRepository.findByMember(member);
    }
}

