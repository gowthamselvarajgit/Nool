package com.nool.backend.dto.dashboard.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AdminRevenueAnalyticsDto {
    private LocalDate date;
    private Long totalFreshCount;
    private Double totalRevenue;
}
