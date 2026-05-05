package com.nool.backend.dto.owner;

import com.nool.backend.enums.OwnerStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OwnerStatusUpdateDto {

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    @NotNull(message = "Owner status is required")
    private OwnerStatus status;
}