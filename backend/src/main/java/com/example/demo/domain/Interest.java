package com.example.demo.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "interests")
public class Interest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false)
    private String interest;

    // 생성자, getter, setter
    public Interest() {}

    public Interest(Member member, String interest) {
        this.member = member;
        this.interest = interest;
    }

    public Long getId() { return id; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public String getInterest() { return interest; }
    public void setInterest(String interest) { this.interest = interest; }
}

