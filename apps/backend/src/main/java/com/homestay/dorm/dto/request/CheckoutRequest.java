package com.homestay.dorm.dto.request;

import com.homestay.dorm.dto.response.OperationAssetResponse;
import lombok.Data;
import java.util.List;

@Data
public class CheckoutRequest {
    private String id; // The contract ID
    private String room;
    private List<OperationAssetResponse> assets;
    private String cleanState;
    private String damages;
    private double penalty;
}
