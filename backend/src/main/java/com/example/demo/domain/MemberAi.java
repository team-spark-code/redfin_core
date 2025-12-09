package com.example.demo.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "member_ai")
public class MemberAi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", unique = true)
    private Member member;

    @Column(nullable = false)
    private String aiCompany;

    public MemberAi() {}
    public MemberAi(Member member, String aiCompany) {
        this.member = member;
        this.aiCompany = aiCompany;
    }
    public Long getId() { return id; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public String getAiCompany() { return aiCompany; }
    public void setAiCompany(String aiCompany) { this.aiCompany = aiCompany; }
}

