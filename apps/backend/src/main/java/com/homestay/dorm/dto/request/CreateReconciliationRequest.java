package com.homestay.dorm.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateReconciliationRequest {
    private String contractId;
    private int ratePercent;
    private BigDecimal deductions;
}
