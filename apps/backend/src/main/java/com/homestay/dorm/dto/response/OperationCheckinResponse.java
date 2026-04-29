package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationCheckinResponse {
    private String id;
    private String room;
    private String tenant;
    private String avatar;
    private String roomType;
    private String moveIn;
    private BigDecimal deposit;
    private String status;
    private List<OperationAssetResponse> assets;
}