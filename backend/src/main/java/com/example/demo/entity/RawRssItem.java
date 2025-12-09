package com.example.demo.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "raw_rss_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawRssItem {
    // 기본 식별
    @Id
    @Column(name = "guid", nullable = false, unique = true, length = 255)
    private String guid;

    @Column(name = "source", nullable = false, length = 500)
    private String source;

    @Column(name = "title", nullable = false, length = 2000)
    private String title;

    @Column(name = "link", nullable = false, length = 2000)
    private String link;

    // 시각/저자
    @Column(name = "pub_date")
    private LocalDateTime pubDate;

    @Column(name = "updated")
    private LocalDateTime updated;

    @Column(name = "dc_creator", length = 500)
    private String dcCreator;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "rss_item_authors",
                    joinColumns = @JoinColumn(name = "rss_item_guid"))
    @Column(name = "author", length = 500)
    private List<String> author;

    // 본문 - TEXT 타입으로 제한
    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "content_encoded", columnDefinition = "LONGTEXT")
    private String contentEncoded;

    // 분류
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "rss_item_categories",
                    joinColumns = @JoinColumn(name = "rss_item_guid"))
    @Column(name = "category", length = 500)
    private List<String> category;

    @Column(name = "dc_subject", length = 1000)
    private String dcSubject;

    // 메타데이터
    @Column(name = "collected_at")
    private LocalDateTime collectedAt;

    @Column(name = "comments", length = 2000)
    private String comments;

    @Column(name = "language", length = 50)
    private String language;

    @Column(name = "copyright", length = 1000)
    private String copyright;

    // 추가 필드들
    @Column(name = "raw_xml", columnDefinition = "LONGTEXT")
    private String rawXml;

    @Column(name = "processed", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean processed = false;

    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        if (collectedAt == null) {
            collectedAt = LocalDateTime.now();
        }
    }
}
