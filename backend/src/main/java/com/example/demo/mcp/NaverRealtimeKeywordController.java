package com.example.demo.mcp;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class NaverRealtimeKeywordController {
    private final NaverRealtimeKeywordService service;

    public NaverRealtimeKeywordController(NaverRealtimeKeywordService service) {
        this.service = service;
    }

    @GetMapping("/api/naver/realtime-keywords")
    public List<String> getRealtimeKeywords() throws Exception {
        return service.fetchRealtimeKeywords();
    }
}

