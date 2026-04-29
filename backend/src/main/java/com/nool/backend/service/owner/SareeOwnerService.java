package com.nool.backend.service.owner;

import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.owner.CreateSareeOwnerRequestDto;
import com.nool.backend.dto.owner.SareeOwnerListDto;
import com.nool.backend.dto.owner.SareeOwnerResponseDto;
import com.nool.backend.dto.owner.UpdateSareeOwnerRequestDto;

public interface SareeOwnerService {

    void createOwner(CreateSareeOwnerRequestDto requestDto);

    void updateOwner(UpdateSareeOwnerRequestDto requestDto);

    SareeOwnerResponseDto getOwnerById (Long ownerId);

    PaginationResponseDto<SareeOwnerListDto> getOwnerList(PaginationRequestDto paginationRequestDto);
}
