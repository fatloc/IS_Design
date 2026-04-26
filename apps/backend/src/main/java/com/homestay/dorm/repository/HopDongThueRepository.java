package com.homestay.dorm.repository;

import com.homestay.dorm.entity.HopDongThue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HopDongThueRepository extends JpaRepository<HopDongThue, String> {
}
