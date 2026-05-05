package com.nool.backend.controller.owner;

import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.owner.*;
import com.nool.backend.service.owner.SareeOwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/owners")
@RequiredArgsConstructor
public class SareeOwnerController {
    private final SareeOwnerService sareeOwnerService;

    @PostMapping
    public SareeOwnerResponseDto createOwner(@Valid @RequestBody CreateSareeOwnerRequestDto requestDto){
        return sareeOwnerService.createOwner(requestDto);
    }

    @GetMapping("/{ownerId}")
    public SareeOwnerResponseDto getOwnerById(@PathVariable Long ownerId){
        return sareeOwnerService.getOwnerById(ownerId);
    }

    @PutMapping
    public void updateOwner(@Valid @RequestBody UpdateSareeOwnerRequestDto requestDto){
        sareeOwnerService.updateOwner(requestDto);
    }

    @PatchMapping("/status")
    public void updateOwnerStatus(@Valid @RequestBody OwnerStatusUpdateDto requestDto){
        sareeOwnerService.updateOwnerStatus(requestDto);
    }

    @PostMapping("/list")
    public PaginationResponseDto<SareeOwnerListDto> getOwnerList(@Valid @RequestBody PaginationRequestDto paginationRequestDto){
        return sareeOwnerService.getOwnerList(paginationRequestDto);
    }
}
