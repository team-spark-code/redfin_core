package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.example.demo.repository.jpa")
@EnableElasticsearchRepositories(basePackages = "com.example.demo.repository.elasticsearch")
@EntityScan(basePackages = {"com.example.demo.domain", "com.example.demo.entity"})
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

}
