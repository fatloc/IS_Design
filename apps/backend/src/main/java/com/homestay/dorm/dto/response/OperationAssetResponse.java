package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationAssetResponse {
    private String asset;
    private boolean present;
    private String condition;
    private String notes;
}