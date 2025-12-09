package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jsonl_data")
public class JsonlData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guid")
    private String guid;

    @Column(name = "source")
    private String source;

    @Column(name = "title", columnDefinition = "TEXT")
    private String title;

    @Column(name = "link", columnDefinition = "TEXT")
    private String link;

    @Column(name = "pub_date")
    private String pubDate;

    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "author")
    private String author;

    @Column(name = "category")
    private String category;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "scraped_at")
    private String scrapedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public JsonlData() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGuid() { return guid; }
    public void setGuid(String guid) { this.guid = guid; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getPubDate() { return pubDate; }
    public void setPubDate(String pubDate) { this.pubDate = pubDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getScrapedAt() { return scrapedAt; }
    public void setScrapedAt(String scrapedAt) { this.scrapedAt = scrapedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
