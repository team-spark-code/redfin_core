package com.example.demo.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "member_job")
public class MemberJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", unique = true)
    private Member member;

    @Column(nullable = false)
    private String job;

    public MemberJob() {}
    public MemberJob(Member member, String job) {
        this.member = member;
        this.job = job;
    }
    public Long getId() { return id; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }
}

