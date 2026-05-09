package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleDashboardResponse {
    private Map<String, Long> requestStatusCounts;
    private Map<String, Long> requestRentalModeCounts;
    private Map<String, Long> depositedByRentalModeCounts;
    private Map<String, Long> requestGenderCounts;

    private List<AppointmentDto> todayAppointments;
    private List<RequestDto> visiblePendingRequests;

    private long pendingRequestsCount;
    private long depositedTodayCount;
    private long yesterdayAppointmentsCount;
    private long yesterdayDepositsCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentDto {
        private String id;
        private String time;
        private String clientName;
        private String rentalMode;
        private String targetAssetLabel;
        private String staffName;
        private String status;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequestDto {
        private String id;
        private String date;
        private String clientName;
        private String phone;
        private String rentalMode;
        private int headcount;
        private String gender;
        private String budget;
        private String status;
        private List<String> criteria;
        private String note;
    }
}
