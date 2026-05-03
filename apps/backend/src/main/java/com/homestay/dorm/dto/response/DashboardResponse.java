package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalRooms;
    private Map<String, Long> roomStatusCounts;
    private long pendingRequests;
    private long pendingAppointments;
    private long pendingTransactions;
    private double monthlyRevenue;
    private List<DashboardTask> urgentTasks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardTask {
        private String id;
        private String title;
        private String desc;
        private String source; // "approvals" | "operations"
        private String priority; // "critical" | "high" | "medium"
        private String time;
        private String tag;
    }
}
