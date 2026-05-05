package com.nool.backend.dto.owner;

import com.nool.backend.enums.OwnerStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SareeOwnerResponseDto {
    private Long ownerId;
    private String ownerName;
    private String mobileNumber;
    private OwnerStatus ownerStatus;
}
