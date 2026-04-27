package com.nool.backend.dto.common;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PaginationRequestDto {

    @Min(value = 0, message = "Page number must be zero or greater")
    private int page = 0;

    @Min(value = 1, message =  "Page size must be at least 1")
    private int size = 10;

    private String sortBy = "createdAt";

    private String sortingDirection = "DESC";
}
