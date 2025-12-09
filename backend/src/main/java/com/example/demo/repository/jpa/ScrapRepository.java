package com.example.demo.repository.jpa;

import com.example.demo.entity.Scrap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScrapRepository extends JpaRepository<Scrap, Long> {
    List<Scrap> findByUsernameOrderByCreatedAtDesc(String username);
}
