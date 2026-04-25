package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private T data;
    private String message;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, "Success");
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(null, message);
    }
}
