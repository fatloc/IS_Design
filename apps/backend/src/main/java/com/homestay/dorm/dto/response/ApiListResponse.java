package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiListResponse<T> {
    private List<T> data;
    private long total;

    public static <T> ApiListResponse<T> ok(List<T> data, long total) {
        return new ApiListResponse<>(data, total);
    }
}
