package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CheckoutRequest;
import com.homestay.dorm.dto.request.HandoverRequest;
import com.homestay.dorm.dto.response.OperationsResponse;

public interface OperationsService {
    OperationsResponse getOperations();
    void confirmHandover(HandoverRequest request);
    void confirmCheckout(CheckoutRequest request);
    void finishCheckout(String id);
}