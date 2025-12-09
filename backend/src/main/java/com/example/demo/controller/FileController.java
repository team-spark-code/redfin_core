package com.example.demo.controller;

import com.example.demo.entity.FileEntity;
import com.example.demo.entity.JsonlData;
import com.example.demo.service.FileService;
import com.example.demo.service.JsonlDataService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private FileService fileService;

    @Autowired
    private JsonlDataService jsonlDataService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/data")
    public ResponseEntity<List<String>> getJsonlFilesFromData() {
        try {
            List<String> fileNames = fileService.getJsonlFileNamesFromDataDirectory();
            return ResponseEntity.ok(fileNames);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/data/{fileName:.+}")
    public ResponseEntity<String> getDataFileContent(@PathVariable String fileName) {
        try {
            String content = fileService.getDataFileContent(fileName);
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // JSONL 파일을 컬럼별로 구조화된 데이터로 반환
    @GetMapping("/data/{fileName:.+}/structured")
    public ResponseEntity<Map<String, Object>> getStructuredDataFileContent(@PathVariable String fileName) {
        try {
            String content = fileService.getDataFileContent(fileName);
            Map<String, Object> structuredData = parseJsonlToStructured(content);
            return ResponseEntity.ok(structuredData);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "JSON 파싱 오류: " + e.getMessage()));
        }
    }

    // JSONL 파일의 컬럼 정보만 반환
    @GetMapping("/data/{fileName:.+}/columns")
    public ResponseEntity<Map<String, Object>> getJsonlColumns(@PathVariable String fileName) {
        try {
            String content = fileService.getDataFileContent(fileName);
            Map<String, Object> columnInfo = getColumnsFromJsonl(content);
            return ResponseEntity.ok(columnInfo);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "JSON 파싱 오류: " + e.getMessage()));
        }
    }

    // JSONL을 구조화된 데이터로 파싱하는 메서드
    private Map<String, Object> parseJsonlToStructured(String jsonlContent) throws IOException {
        String[] lines = jsonlContent.split("\n");
        List<Map<String, Object>> records = new ArrayList<>();
        Set<String> allColumns = new LinkedHashSet<>();

        for (String line : lines) {
            if (line.trim().isEmpty()) continue;

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
        }

        Map<String, Object> result = new HashMap<>();
        result.put("columns", new ArrayList<>(allColumns));
        result.put("data", records);
        result.put("totalRecords", records.size());

        return result;
    }

    // JSONL 파일의 컬럼 정보를 추출하는 메서드
    private Map<String, Object> getColumnsFromJsonl(String jsonlContent) throws IOException {
        String[] lines = jsonlContent.split("\n");
        Set<String> allColumns = new LinkedHashSet<>();
        Map<String, String> columnTypes = new HashMap<>();
        Map<String, Integer> columnCounts = new HashMap<>();

        int totalLines = 0;

        for (String line : lines) {
            if (line.trim().isEmpty()) continue;
            totalLines++;

            JsonNode jsonNode = objectMapper.readTree(line);

            jsonNode.fields().forEachRemaining(entry -> {
                String key = entry.getKey();
                JsonNode value = entry.getValue();
                allColumns.add(key);

                // 컬럼별 카운트
                columnCounts.put(key, columnCounts.getOrDefault(key, 0) + 1);

                // 데이터 타입 추정
                if (!columnTypes.containsKey(key)) {
                    if (value.isTextual()) {
                        columnTypes.put(key, "String");
                    } else if (value.isInt()) {
                        columnTypes.put(key, "Integer");
                    } else if (value.isDouble()) {
                        columnTypes.put(key, "Double");
                    } else if (value.isBoolean()) {
                        columnTypes.put(key, "Boolean");
                    } else if (value.isNull()) {
                        columnTypes.put(key, "Null");
                    } else {
                        columnTypes.put(key, "Object");
                    }
                }
            });
        }

        // 컬럼별 상세 정보 생성
        List<Map<String, Object>> columnDetails = new ArrayList<>();
        for (String column : allColumns) {
            Map<String, Object> detail = new HashMap<>();
            detail.put("name", column);
            detail.put("type", columnTypes.get(column));
            detail.put("count", columnCounts.get(column));
            detail.put("percentage", String.format("%.1f%%", (columnCounts.get(column) * 100.0) / totalLines));
            columnDetails.add(detail);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalColumns", allColumns.size());
        result.put("totalRecords", totalLines);
        result.put("columns", new ArrayList<>(allColumns));
        result.put("columnDetails", columnDetails);

        return result;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileEntity> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            FileEntity savedFile = fileService.saveFileFromUpload(file);
            return ResponseEntity.ok(savedFile);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/save-from-path")
    public ResponseEntity<FileEntity> saveFileFromPath(@RequestParam("filePath") String filePath) {
        try {
            FileEntity savedFile = fileService.saveFileFromPath(filePath);
            return ResponseEntity.ok(savedFile);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<FileEntity>> getAllFiles() {
        List<FileEntity> files = fileService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileEntity> getFileById(@PathVariable Long id) {
        Optional<FileEntity> file = fileService.getFileById(id);
        return file.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<FileEntity>> searchFiles(@RequestParam("fileName") String fileName) {
        List<FileEntity> files = fileService.searchFiles(fileName);
        return ResponseEntity.ok(files);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    // JSONL 파일을 RawRssItem 테이블에 저장
    @PostMapping("/data/{fileName:.+}/save-to-database")
    public ResponseEntity<Map<String, Object>> saveJsonlToDatabase(@PathVariable String fileName) {
        try {
            int savedCount = fileService.saveJsonlToRawRssItem(fileName);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("savedCount", savedCount);
            result.put("message", savedCount + "개의 항목이 저장되었습니다.");
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "파일을 찾을 수 없습니다: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "데이터베이스 저장 오류: " + e.getMessage()));
        }
    }

    // JSONL 파일을 JsonlData 테이블에 저장
    @PostMapping("/data/{fileName:.+}/save-to-db")
    public ResponseEntity<Map<String, Object>> saveJsonlToJsonlDataTable(@PathVariable String fileName) {
        try {
            String content = fileService.getDataFileContent(fileName);
            int savedCount = jsonlDataService.saveJsonlData(content);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "JSONL 파일이 성공적으로 저장되었습니다.");
            result.put("savedRecords", savedCount);

            return ResponseEntity.ok(result);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "파일을 읽을 수 없습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 저장된 JSONL 데이터 조회
    @GetMapping("/jsonl-data")
    public ResponseEntity<List<JsonlData>> getAllJsonlData() {
        try {
            List<JsonlData> data = jsonlDataService.getAllJsonlData();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // JSONL 데이터 검색
    @GetMapping("/jsonl-data/search")
    public ResponseEntity<List<JsonlData>> searchJsonlData(@RequestParam String keyword) {
        try {
            List<JsonlData> data = jsonlDataService.searchJsonlData(keyword);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 소스별 JSONL 데이터 조회
    @GetMapping("/jsonl-data/source/{source}")
    public ResponseEntity<List<JsonlData>> getJsonlDataBySource(@PathVariable String source) {
        try {
            List<JsonlData> data = jsonlDataService.getJsonlDataBySource(source);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // JSONL 데이터 삭제
    @DeleteMapping("/jsonl-data/{id}")
    public ResponseEntity<Map<String, Object>> deleteJsonlData(@PathVariable Long id) {
        try {
            jsonlDataService.deleteJsonlData(id);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "데이터가 성공적으로 삭제되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "삭제 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
