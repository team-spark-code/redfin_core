package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NewsCategorizationService {

    private static final Map<String, List<String>> keywordMap = new HashMap<>();

    static {
        keywordMap.put("정치", Arrays.asList("대통령", "국회", "정부", "여당", "야당", "선거", "법안", "정책"));
        keywordMap.put("경제", Arrays.asList("경제", "증시", "주가", "금리", "부동산", "투자", "기업", "수출", "무역"));
        keywordMap.put("사회", Arrays.asList("사회", "사건", "사고", "날씨", "교육", "노동", "환경", "인권"));
        keywordMap.put("IT/과학", Arrays.asList("IT", "기술", "과학", "AI", "인공지능", "반도체", "스타트업", "우주"));
        keywordMap.put("스포츠", Arrays.asList("스포츠", "야구", "축구", "농구", "올림픽", "선수"));
    }

    public String categorize(String title, String description) {
        String content = (title != null ? title : "") + " " + (description != null ? description : "");

        for (Map.Entry<String, List<String>> entry : keywordMap.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (content.contains(keyword)) {
                    return entry.getKey();
                }
            }
        }
        return "기타"; // Default category
    }
}
