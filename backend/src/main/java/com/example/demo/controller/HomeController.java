package com.example.demo.controller;

import com.example.demo.service.FileService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.util.*;

@Controller
public class HomeController {

    @Autowired
    private FileService fileService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/rss")
    public String rssIndex(Model model, @RequestParam(required = false) String fileName,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "10") int size) {
        try {
            // 파일 목록 가져오기
            List<String> fileNames = fileService.getJsonlFileNamesFromDataDirectory();
            model.addAttribute("fileNames", fileNames);

            // 특정 파일이 선택된 경우 데이터 로드
            if (fileName != null && !fileName.trim().isEmpty()) {
                try {
                    String content = fileService.getDataFileContent(fileName);
                    Map<String, Object> structuredData = parseJsonlToStructured(content);

                    // 페이징 처리
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> allData = (List<Map<String, Object>>) structuredData.get("data");
                    int totalRecords = allData.size();
                    int totalPages = (int) Math.ceil((double) totalRecords / size);

                    // 페이지 범위 계산
                    int startIndex = (page - 1) * size;
                    int endIndex = Math.min(startIndex + size, totalRecords);

                    List<Map<String, Object>> pageData = allData.subList(startIndex, endIndex);

                    model.addAttribute("selectedFile", fileName);
                    model.addAttribute("columns", structuredData.get("columns"));
                    model.addAttribute("data", pageData);
                    model.addAttribute("totalRecords", totalRecords);
                    model.addAttribute("currentPage", page);
                    model.addAttribute("totalPages", totalPages);
                    model.addAttribute("pageSize", size);
                    model.addAttribute("hasNext", page < totalPages);
                    model.addAttribute("hasPrev", page > 1);
                    model.addAttribute("nextPage", page + 1);
                    model.addAttribute("prevPage", page - 1);

                } catch (IOException e) {
                    model.addAttribute("error", "파일을 읽을 수 없습니다: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            model.addAttribute("error", "파일 목록을 가져올 수 없습니다: " + e.getMessage());
            model.addAttribute("fileNames", new ArrayList<>());
        }

        return "rss_index";
    }

    @GetMapping("/health")
    @ResponseBody
    public String health() {
        return "애플리케이션이 정상적으로 실행되고 있습니다!";
    }

    // JSONL을 구조화된 데이터로 파싱하는 메서드
    private Map<String, Object> parseJsonlToStructured(String jsonlContent) throws IOException {
        String[] lines = jsonlContent.split("\n");
        List<Map<String, Object>> records = new ArrayList<>();
        Set<String> allColumns = new LinkedHashSet<>();

        System.out.println("파싱할 라인 수: " + lines.length); // 디버깅 로그

        for (String line : lines) {
            if (line.trim().isEmpty()) continue;

            try {
                JsonNode jsonNode = objectMapper.readTree(line);
                Map<String, Object> record = new HashMap<>();

                // JSON의 모든 필드를 추출
                jsonNode.fields().forEachRemaining(entry -> {
                    String key = entry.getKey();
                    JsonNode value = entry.getValue();
                    allColumns.add(key);

                    if (value.isTextual()) {
                        record.put(key, value.asText());
                    } else if (value.isNumber()) {
                        record.put(key, value.asDouble());
                    } else if (value.isBoolean()) {
                        record.put(key, value.asBoolean());
                    } else if (value.isNull()) {
                        record.put(key, null);
                    } else {
                        record.put(key, value.toString());
                    }
                });

                records.add(record);
            } catch (Exception e) {
                System.err.println("라인 파싱 오류: " + e.getMessage() + " - 라인: " + line);
            }
        }

        System.out.println("파싱된 레코드 수: " + records.size()); // 디버깅 로그
        System.out.println("파싱된 컬럼 수: " + allColumns.size()); // 디버깅 로그
        System.out.println("컬럼 목록: " + allColumns); // 디버깅 로그

        if (!records.isEmpty()) {
            System.out.println("첫 번째 레코드 샘플: " + records.get(0)); // 디버깅 로그
        }

        Map<String, Object> result = new HashMap<>();
        result.put("columns", new ArrayList<>(allColumns));
        result.put("data", records);
        result.put("totalRecords", records.size());

        return result;
    }
}
