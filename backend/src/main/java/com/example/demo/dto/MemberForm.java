package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberForm {
    private String username; // 아이디(로그인용)
    private String name;     // 이름(실명)
    private String password;
    private String passwordConfirm;
    private String email;

    // 전화번호 필드 추가
    private String phone1;
    private String phone2;
    private String phone3;

    private String zipcode;
    private String address;
    private String detailAddress;
}
