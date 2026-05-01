package com.nool.backend.dto.dashboard.worker;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class WorkerEarningsAnalyticsDto {
    private LocalDate date;
    private Integer freshWorkCount;
    private Integer repolishWorkCount;
    private Double earning;

    private Boolean isAbsent;
}
