package com.example.demo.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "member_ai_field")
public class MemberAiField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", unique = true)
    private Member member;

    @Column(nullable = false)
    private String aiField;

    public MemberAiField() {}
    public MemberAiField(Member member, String aiField) {
        this.member = member;
        this.aiField = aiField;
    }
    public Long getId() { return id; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public String getAiField() { return aiField; }
    public void setAiField(String aiField) { this.aiField = aiField; }
}

