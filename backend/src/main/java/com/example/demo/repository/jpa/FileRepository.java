package com.example.demo.repository.jpa;

import com.example.demo.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    Optional<FileEntity> findByFileName(String fileName);
    Optional<FileEntity> findByFilePath(String filePath);
    List<FileEntity> findByFileNameContaining(String fileName);
    @Query("SELECT f FROM FileEntity f ORDER BY f.createdAt DESC")
    List<FileEntity> findAllOrderByCreatedAtDesc();
    List<FileEntity> findByFileSizeGreaterThan(Long fileSize);
    List<FileEntity> findByFileSizeBetween(Long minSize, Long maxSize);
}

