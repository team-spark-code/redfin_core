package com.example.demo.service;

import com.example.demo.entity.Scrap;
import com.example.demo.repository.jpa.ScrapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ScrapService {

    @Autowired
    private ScrapRepository scrapRepository;

    @Autowired
    private OpenGraphService openGraphService;

    @Autowired
    private NewsCategorizationService newsCategorizationService;

    @Transactional
    public Scrap saveScrap(String username, String url) {
        // 1. Get Open Graph data
        Map<String, String> ogData = openGraphService.getOpenGraphData(url);

        // 2. Create and populate Scrap entity
        Scrap scrap = new Scrap();
        scrap.setUsername(username);
        scrap.setUrl(url);
        scrap.setCreatedAt(LocalDateTime.now());

        String title = ogData.get("og:title");
        String description = ogData.get("og:description");

        scrap.setTitle(title);
        scrap.setDescription(description);
        scrap.setThumbnailUrl(ogData.get("og:image"));
        scrap.setPublisher(ogData.get("og:site_name"));
        scrap.setPublishedDate(ogData.get("article:published_time"));

        // 3. Categorize the news
        String category = newsCategorizationService.categorize(title, description);
        scrap.setCategory(category);

        // 4. Save the entity
        return scrapRepository.save(scrap);
    }

    @Transactional(readOnly = true)
    public List<Scrap> getScrapsByUsername(String username) {
        return scrapRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    @Transactional
    public void deleteScrap(Long scrapId, String username) {
        Scrap scrap = scrapRepository.findById(scrapId)
                .orElseThrow(() -> new IllegalArgumentException("Scrap not found with id: " + scrapId));

        if (!scrap.getUsername().equals(username)) {
            throw new IllegalStateException("You are not authorized to delete this scrap.");
        }

        scrapRepository.delete(scrap);
    }
}
