package com.example.demo.repository.jpa;

import com.example.demo.domain.Member;
import com.example.demo.domain.MemberAi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberAiRepository extends JpaRepository<MemberAi, Long> {
    Optional<MemberAi> findByMember(Member member);
}

