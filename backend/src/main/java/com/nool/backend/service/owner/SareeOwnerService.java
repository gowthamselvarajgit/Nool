package com.nool.backend.service.owner;

import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.owner.*;

import java.awt.image.VolatileImage;

public interface SareeOwnerService {

    SareeOwnerResponseDto createOwner(CreateSareeOwnerRequestDto requestDto);

    void updateOwner(UpdateSareeOwnerRequestDto requestDto);

    SareeOwnerResponseDto getOwnerById (Long ownerId);

    void updateOwnerStatus(OwnerStatusUpdateDto requestDto);

    PaginationResponseDto<SareeOwnerListDto> getOwnerList(PaginationRequestDto paginationRequestDto);

    SareeOwnerResponseDto getMyProfile();
}
