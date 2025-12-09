package com.example.demo.repository.jpa;

import com.example.demo.entity.RawRssItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RawRssItemRepository extends JpaRepository<RawRssItem, String> {
    List<RawRssItem> findBySourceOrderByCollectedAtDesc(String source);
    @Query("SELECT r FROM RawRssItem r ORDER BY r.collectedAt DESC")
    List<RawRssItem> findTopByOrderByCollectedAtDesc(@Param("limit") int limit);
    List<RawRssItem> findByCollectedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<RawRssItem> findByTitleContainingIgnoreCase(String title);
    List<RawRssItem> findBySourceAndCollectedAtBetween(String source, LocalDateTime startDate, LocalDateTime endDate);
}

