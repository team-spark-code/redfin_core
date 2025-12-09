package com.example.demo.service;

import com.example.demo.entity.FileEntity;
import com.example.demo.entity.RawRssItem;
import com.example.demo.repository.jpa.FileRepository;
import com.example.demo.repository.jpa.RawRssItemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private RawRssItemRepository rawRssItemRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path dataDirectory = Paths.get("d:\\data");

    public List<String> getJsonlFileNamesFromDataDirectory() throws IOException {
        if (!Files.exists(dataDirectory) || !Files.isDirectory(dataDirectory)) {
            throw new IOException("Data directory not found: " + dataDirectory);
        }

        try (var stream = Files.list(dataDirectory)) {
            return stream
                    .filter(path -> !Files.isDirectory(path) && path.toString().toLowerCase().endsWith(".jsonl"))
                    .map(path -> path.getFileName().toString())
                    .collect(Collectors.toList());
        }
    }

    public String getDataFileContent(String fileName) throws IOException {
        Path filePath = dataDirectory.resolve(fileName).normalize();

        if (!filePath.startsWith(dataDirectory)) {
            throw new IOException("Access denied to file: " + fileName);
        }

        if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
            throw new IOException("File not found or is a directory: " + fileName);
        }

        return Files.readString(filePath, StandardCharsets.UTF_8);
    }

    public FileEntity saveFileFromPath(String filePath) throws IOException {
        Path path = Paths.get(filePath);

        if (!Files.exists(path)) {
            throw new IOException("파일을 찾을 수 없습니다: " + filePath);
        }

        String content = Files.readString(path, StandardCharsets.UTF_8);
        String fileName = path.getFileName().toString();
        long fileSize = Files.size(path);

        Optional<FileEntity> existingFile = fileRepository.findByFilePath(filePath);

        FileEntity entity;
        if (existingFile.isPresent()) {
            entity = existingFile.get();
            entity.setContent(content);
            entity.setFileSize(fileSize);
        } else {
            entity = FileEntity.builder()
                    .fileName(fileName)
                    .filePath(filePath)
                    .content(content)
                    .fileSize(fileSize)
                    .build();
        }

        return fileRepository.save(entity);
    }

    public FileEntity saveFileFromUpload(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드된 파일이 비어있습니다.");
        }

        String fileName = file.getOriginalFilename();
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);
        long fileSize = file.getSize();

        FileEntity fileEntity = FileEntity.builder()
                .fileName(fileName)
                .content(content)
                .fileSize(fileSize)
                .build();

        return fileRepository.save(fileEntity);
    }

    public List<FileEntity> getAllFiles() {
        return fileRepository.findAllOrderByCreatedAtDesc();
    }

    public Optional<FileEntity> getFileById(Long id) {
        return fileRepository.findById(id);
    }

    public Optional<FileEntity> getFileByName(String fileName) {
        return fileRepository.findByFileName(fileName);
    }

    public List<FileEntity> searchFiles(String fileName) {
        return fileRepository.findByFileNameContaining(fileName);
    }

    public void deleteFile(Long id) {
        fileRepository.deleteById(id);
    }

    // JSONL 파일을 파싱하여 RawRssItem 테이블에 저장
    public int saveJsonlToRawRssItem(String fileName) throws IOException {
        Path filePath = dataDirectory.resolve(fileName).normalize();
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + filePath);
        }
        int savedCount = 0;
        List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);
        for (String line : lines) {
            if (line.isBlank()) continue;
            try {
                JsonNode node = objectMapper.readTree(line);
                RawRssItem item = RawRssItem.builder()
                        .guid(node.path("guid").asText(null))
                        .source(node.path("source").asText(null))
                        .title(node.path("title").asText(null))
                        .link(node.path("link").asText(null))
                        .pubDate(parseDateTime(node.path("pub_date").asText(null)))
                        .updated(parseDateTime(node.path("updated").asText(null)))
                        .dcCreator(node.path("dc_creator").asText(null))
                        .description(node.path("description").asText(null))
                        .contentEncoded(node.path("content_encoded").asText(null))
                        .dcSubject(node.path("dc_subject").asText(null))
                        .copyright(node.path("copyright").asText(null))
                        .collectedAt(parseDateTime(node.path("collected_at").asText(null)))
                        .rawXml(node.path("raw_xml").asText(null))
                        .build();
                if (item.getGuid() != null) {
                    rawRssItemRepository.save(item);
                    savedCount++;
                }
            } catch (Exception e) {
                // 개별 라인 에러 무시, 로그만 남김
                System.err.println("[WARN] JSONL 라인 파싱/저장 실패: " + e.getMessage());
            }
        }
        return savedCount;
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ISO_DATE_TIME);
        } catch (DateTimeParseException e) {
            // 다른 포맷 시도 가능
            return null;
        }
    }
}
