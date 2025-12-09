package com.example.demo.repository.jpa;

import com.example.demo.domain.Member;
import com.example.demo.domain.MemberJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberJobRepository extends JpaRepository<MemberJob, Long> {
    Optional<MemberJob> findByMember(Member member);
}

