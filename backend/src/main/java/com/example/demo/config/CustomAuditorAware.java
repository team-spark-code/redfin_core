package com.example.demo.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class CustomAuditorAware implements AuditorAware<String> {
    private static final ThreadLocal<String> auditorHolder = new ThreadLocal<>();

    public static void setAuditor(String username) {
        auditorHolder.set(username);
    }

    public static void clear() {
        auditorHolder.remove();
    }

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.ofNullable(auditorHolder.get());
    }
}

