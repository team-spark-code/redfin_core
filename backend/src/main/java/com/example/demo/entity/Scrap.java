package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scrap")
public class Scrap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username; // 사용자 식별자(로그인 아이디)

    @Column(nullable = false, length = 1024)
    private String url; // 스크랩한 뉴스 URL

    @Column(nullable = false)
    private LocalDateTime createdAt; // 스크랩 시각

    private String title; // 제목

    @Column(length = 2048)
    private String description; // 내용 일부

    @Column(length = 1024)
    private String thumbnailUrl; // 썸네일 URL

    private String publisher; // 뉴스 벤더

    private String publishedDate; // 발행일

    private String category; // 카테고리

    public Scrap() {}

    public Scrap(String username, String url, LocalDateTime createdAt) {
        this.username = username;
        this.url = url;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getPublishedDate() { return publishedDate; }
    public void setPublishedDate(String publishedDate) { this.publishedDate = publishedDate; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
