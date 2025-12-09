package com.example.demo.mcp;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class NaverRealtimeKeywordService {
    public List<String> fetchRealtimeKeywords() throws Exception {
        List<String> keywords = new ArrayList<>();
        Document doc = Jsoup.connect("https://datalab.naver.com/keyword/realtimeList.naver").get();
        Elements items = doc.select(".item_title");
        for (var item : items) {
            keywords.add(item.text());
        }
        return keywords;
    }
}

