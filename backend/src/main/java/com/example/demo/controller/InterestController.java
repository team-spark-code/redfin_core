package com.example.demo.controller;

import com.example.demo.service.InterestService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class InterestController {
    private final InterestService interestService;

    public InterestController(InterestService interestService) {
        this.interestService = interestService;
    }
}
