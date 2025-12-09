package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private boolean success;
    private String message;
    private Long member_id;
    private String email;
    private String name;

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, Long member_id, String email, String name) {
        this.success = success;
        this.message = message;
        this.member_id = member_id;
        this.email = email;
        this.name = name;
    }
}
