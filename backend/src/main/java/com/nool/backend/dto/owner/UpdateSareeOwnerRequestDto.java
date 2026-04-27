package com.nool.backend.dto.owner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateSareeOwnerRequestDto {

    @NotNull(message = "Owner id is required")
    private Long ownerId;

    @NotBlank(message = "Owner name is required")
    private String ownerName;


    @NotBlank(message = "Mobile number is required")
    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Mobile number must be a valid 10-digit Indian mobile number"
    )
    private String mobileNumber;
}
