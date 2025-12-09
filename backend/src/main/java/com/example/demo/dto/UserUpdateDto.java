package com.example.demo.dto;

import lombok.Data;

@Data
public class UserUpdateDto {
    private String name;
    private String email;
    private String phone;
    private String zipCode;
    private String address;
    private String detailAddress;
    private String bio;
}
