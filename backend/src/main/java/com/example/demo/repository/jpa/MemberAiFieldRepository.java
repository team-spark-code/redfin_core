package com.example.demo.repository.jpa;

import com.example.demo.domain.Member;
import com.example.demo.domain.MemberAiField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberAiFieldRepository extends JpaRepository<MemberAiField, Long> {
    Optional<MemberAiField> findByMember(Member member);
}

