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

    //✅ SAREE OWNER CREATE API – PASSED
    @PostMapping
    public SareeOwnerResponseDto createOwner(@Valid @RequestBody CreateSareeOwnerRequestDto requestDto){
        return sareeOwnerService.createOwner(requestDto);
    }

    //✅ SAREE OWNER GET API – PASSED
    @GetMapping("/{ownerId}")
    public SareeOwnerResponseDto getOwnerById(@PathVariable Long ownerId){
        return sareeOwnerService.getOwnerById(ownerId);
    }

    //✅ SAREE OWNER UPDATE API – PASSED
    @PutMapping
    public void updateOwner(@Valid @RequestBody UpdateSareeOwnerRequestDto requestDto){
        sareeOwnerService.updateOwner(requestDto);
    }

    //✅ SAREE OWNER STATUS UPDATE API – PASSED
    @PatchMapping("/status")
    public void updateOwnerStatus(@Valid @RequestBody OwnerStatusUpdateDto requestDto){
        sareeOwnerService.updateOwnerStatus(requestDto);
    }

    //✅ SAREE OWNER LIST API – PASSED
    @PostMapping("/list")
    public PaginationResponseDto<SareeOwnerListDto> getOwnerList(@Valid @RequestBody PaginationRequestDto paginationRequestDto){
        return sareeOwnerService.getOwnerList(paginationRequestDto);
    }


    @GetMapping("/me")
    public SareeOwnerResponseDto getMyProfile(){
        return sareeOwnerService.getMyProfile();
    }


}
