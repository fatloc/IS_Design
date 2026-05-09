package com.homestay.dorm.repository;

import com.homestay.dorm.entity.BangDoiSoat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BangDoiSoatRepository extends JpaRepository<BangDoiSoat, String> {
    List<BangDoiSoat> findByTrangThai(String trangThai);
}
