package com.homestay.dorm.repository;

import com.homestay.dorm.entity.Giuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GiuongRepository extends JpaRepository<Giuong, String> {
}