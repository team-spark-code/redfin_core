package com.example.demo.controller;

import com.example.demo.entity.RawRssItem;
import com.example.demo.repository.jpa.RawRssItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rss-items")
@CrossOrigin(origins = "*")
public class RawRssItemController {

    @Autowired
    private RawRssItemRepository repository;

    // 모든 RSS 아이템 조회
    @GetMapping
    public List<RawRssItem> getAllRssItems() {
        return repository.findAll();
    }

    // 특정 RSS 아이템 조회
    @GetMapping("/{guid}")
    public ResponseEntity<RawRssItem> getRssItemByGuid(@PathVariable String guid) {
        Optional<RawRssItem> item = repository.findById(guid);
        if (item.isPresent()) {
            return ResponseEntity.ok(item.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // RSS 아이템 생성/수정
    @PostMapping
    public ResponseEntity<RawRssItem> createOrUpdateRssItem(@RequestBody RawRssItem rssItem) {
        try {
            // collectedAt이 없으면 현재 시간으로 설정
            if (rssItem.getCollectedAt() == null) {
                rssItem.setCollectedAt(LocalDateTime.now());
            }

            RawRssItem savedItem = repository.save(rssItem);
            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // RSS 아이템 삭제
    @DeleteMapping("/{guid}")
    public ResponseEntity<Void> deleteRssItem(@PathVariable String guid) {
        try {
            if (repository.existsById(guid)) {
                repository.deleteById(guid);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 소스별 RSS 아이템 조회
    @GetMapping("/by-source/{source}")
    public List<RawRssItem> getRssItemsBySource(@PathVariable String source) {
        return repository.findBySourceOrderByCollectedAtDesc(source);
    }

    // 최근 수집된 RSS 아이템 조회
    @GetMapping("/recent")
    public List<RawRssItem> getRecentRssItems(@RequestParam(defaultValue = "10") int limit) {
        return repository.findTopByOrderByCollectedAtDesc(limit);
    }
}
