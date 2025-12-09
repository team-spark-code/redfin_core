package com.example.demo.repository.jpa;

import com.example.demo.domain.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByUsername(String username);
    Member findByEmail(String email);

    // 검색 메서드들 추가
    Page<Member> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Member> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
    Page<Member> findByEmailContainingIgnoreCase(String email, Pageable pageable);
}
