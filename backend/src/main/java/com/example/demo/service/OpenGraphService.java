package com.example.demo.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class OpenGraphService {

    public Map<String, String> getOpenGraphData(String url) {
        Map<String, String> data = new HashMap<>();
        try {
            Document doc = Jsoup.connect(url)
                                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                                .get();

            // Extract Open Graph data
            for (Element meta : doc.select("meta[property^=og:]")) {
                String property = meta.attr("property");
                String content = meta.attr("content");
                data.put(property, content);
            }

            // Extract article-specific tags
            Element publishedTime = doc.select("meta[property=article:published_time]").first();
            if (publishedTime != null) {
                data.put("article:published_time", publishedTime.attr("content"));
            }

            // Fallback for missing OG tags
            if (!data.containsKey("og:title")) {
                data.put("og:title", doc.title());
            }
            if (!data.containsKey("og:description")) {
                Element desc = doc.select("meta[name=description]").first();
                if (desc != null) {
                    data.put("og:description", desc.attr("content"));
                }
            }

        } catch (IOException e) {
            System.err.println("Error fetching Open Graph data from " + url + ": " + e.getMessage());
        }
        return data;
    }
}
