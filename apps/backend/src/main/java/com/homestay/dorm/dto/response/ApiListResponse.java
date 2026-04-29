package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiListResponse<T> {
    private List<T> data;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;

    public static <T> ApiListResponse<T> ok(List<T> data, long totalElements) {
        return new ApiListResponse<>(data, totalElements, 1, 0, data.size());
    }

    public static <T> ApiListResponse<T> fromPage(Page<T> pageData) {
        return new ApiListResponse<>(
                pageData.getContent(),
                pageData.getTotalElements(),
                pageData.getTotalPages(),
                pageData.getNumber(),
                pageData.getSize()
        );
    }
}
