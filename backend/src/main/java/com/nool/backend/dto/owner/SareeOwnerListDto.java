package com.nool.backend.dto.owner;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SareeOwnerListDto{
    private Long ownerId;
    private String ownerName;
    private String mobileNumber;
    private String status;
}
