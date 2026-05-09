package com.homestay.dorm.dto.request;

import com.homestay.dorm.dto.response.OperationAssetResponse;
import lombok.Data;
import java.util.List;

@Data
public class HandoverRequest {
    private String id; // The deposit or contract ID
    private String room;
    private List<OperationAssetResponse> assets;
    private String notes;
}
