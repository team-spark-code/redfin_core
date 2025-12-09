package com.example.demo.repository.jpa;

import com.example.demo.entity.JsonlData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JsonlDataRepository extends JpaRepository<JsonlData, Long> {
    Optional<JsonlData> findByGuid(String guid);
    List<JsonlData> findBySource(String source);
    List<JsonlData> findByAuthor(String author);
    @Query("SELECT j FROM JsonlData j WHERE j.title LIKE %:keyword%")
    List<JsonlData> findByTitleContaining(@Param("keyword") String keyword);
    @Query("SELECT j FROM JsonlData j WHERE j.description LIKE %:keyword%")
    List<JsonlData> findByDescriptionContaining(@Param("keyword") String keyword);
    @Query("SELECT j FROM JsonlData j WHERE j.title LIKE %:keyword% OR j.description LIKE %:keyword% OR j.author LIKE %:keyword%")
    List<JsonlData> findByKeyword(@Param("keyword") String keyword);
}

