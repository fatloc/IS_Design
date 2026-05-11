package com.homestay.dorm.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("dashboardStats", "saleDashboardStats");
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(2, TimeUnit.MINUTES)    // TTL 2 phút - dashboard không cần real-time
                .maximumSize(50)                          // Tăng size để cache nhiều hơn
                .recordStats());                          // Ghi stats để debug
        return manager;
    }
}
