package com.example.demo.service;

import com.example.demo.entity.JsonlData;
import com.example.demo.repository.jpa.JsonlDataRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class JsonlDataService {

    @Autowired
    private JsonlDataRepository jsonlDataRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * JSONL 파일 내용을 DB에 저장
     */
    @Transactional
    public int saveJsonlData(String jsonlContent) throws IOException {
        String[] lines = jsonlContent.split("\n");
        int savedCount = 0;
        int duplicateCount = 0;

        for (String line : lines) {
            if (line.trim().isEmpty()) continue;

            try {
                JsonNode jsonNode = objectMapper.readTree(line);

                // GUID로 중복 체크
                String guid = jsonNode.has("guid") ? jsonNode.get("guid").asText() : null;
                if (guid != null && jsonlDataRepository.findByGuid(guid).isPresent()) {
                    duplicateCount++;
                    continue;
                }

                JsonlData jsonlData = new JsonlData();

                // 각 필드 매핑
                jsonlData.setGuid(guid);
                jsonlData.setSource(getTextValue(jsonNode, "source"));
                jsonlData.setTitle(getTextValue(jsonNode, "title"));
                jsonlData.setLink(getTextValue(jsonNode, "link"));
                jsonlData.setPubDate(getTextValue(jsonNode, "pub_date"));
                jsonlData.setDescription(getTextValue(jsonNode, "description"));
                jsonlData.setAuthor(getTextValue(jsonNode, "author"));
                jsonlData.setCategory(getTextValue(jsonNode, "category"));

                // tags 배열을 문자열로 변환
                if (jsonNode.has("tags") && jsonNode.get("tags").isArray()) {
                    StringBuilder tagsBuilder = new StringBuilder();
                    jsonNode.get("tags").forEach(tag -> {
                        if (tagsBuilder.length() > 0) tagsBuilder.append(", ");
                        tagsBuilder.append(tag.asText());
                    });
                    jsonlData.setTags(tagsBuilder.toString());
                } else {
                    jsonlData.setTags(getTextValue(jsonNode, "tags"));
                }

                jsonlData.setGroupName(getTextValue(jsonNode, "group"));
                jsonlData.setScrapedAt(getTextValue(jsonNode, "scraped_at"));

                jsonlDataRepository.save(jsonlData);
                savedCount++;

            } catch (Exception e) {
                System.err.println("라인 파싱 오류: " + line);
                e.printStackTrace();
            }
        }

        System.out.println("저장된 레코드 수: " + savedCount + ", 중복 건수: " + duplicateCount);
        return savedCount;
    }

    /**
     * JsonNode에서 텍스트 값을 안전하게 가져오는 헬퍼 메서드
     */
    private String getTextValue(JsonNode node, String fieldName) {
        return node.has(fieldName) && !node.get(fieldName).isNull()
            ? node.get(fieldName).asText()
            : null;
    }

    /**
     * 모든 JSONL 데이터 조회
     */
    public List<JsonlData> getAllJsonlData() {
        return jsonlDataRepository.findAll();
    }

    /**
     * ID로 JSONL 데이터 조회
     */
    public Optional<JsonlData> getJsonlDataById(Long id) {
        return jsonlDataRepository.findById(id);
    }

    /**
     * 키워드로 검색
     */
    public List<JsonlData> searchJsonlData(String keyword) {
        return jsonlDataRepository.findByKeyword(keyword);
    }

    /**
     * 소스별 데이터 조회
     */
    public List<JsonlData> getJsonlDataBySource(String source) {
        return jsonlDataRepository.findBySource(source);
    }

    /**
     * 작성자별 데이터 조회
     */
    public List<JsonlData> getJsonlDataByAuthor(String author) {
        return jsonlDataRepository.findByAuthor(author);
    }

    /**
     * JSONL 데이터 삭제
     */
    public void deleteJsonlData(Long id) {
        jsonlDataRepository.deleteById(id);
    }

    /**
     * 모든 JSONL 데이터 삭제
     */
    @Transactional
    public void deleteAllJsonlData() {
        jsonlDataRepository.deleteAll();
    }
}
