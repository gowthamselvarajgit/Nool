package com.nool.backend.dto.inventory;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SareeReturnResponseDto {
    private Long returnId;
    private LocalDate returnedDate;
    private Integer returnedQuantity;
    private String remarks;
}
