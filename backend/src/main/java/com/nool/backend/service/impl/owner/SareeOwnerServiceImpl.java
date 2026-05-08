package com.nool.backend.service.impl.owner;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.owner.*;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.enums.OwnerStatus;
import com.nool.backend.exception.DuplicateResourceException;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.owner.SareeOwnerRepository;
import com.nool.backend.service.owner.SareeOwnerService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SareeOwnerServiceImpl implements SareeOwnerService {

    private final SareeOwnerRepository sareeOwnerRepository;
    @Override
    public SareeOwnerResponseDto createOwner(CreateSareeOwnerRequestDto requestDto) {

        if (sareeOwnerRepository.existsByMobileNumber(requestDto.getMobileNumber())) {
            throw new DuplicateResourceException("Owner with this mobile number already exists");
        }


        SareeOwner sareeOwner = SareeOwner.builder()
                .ownerName(requestDto.getOwnerName())
                .mobileNumber(requestDto.getMobileNumber())
                .status(OwnerStatus.ACTIVE)
                .build();

        SareeOwner saved = sareeOwnerRepository.save(sareeOwner);

        return SareeOwnerResponseDto.builder()
                .ownerId(saved.getId())
                .ownerName(saved.getOwnerName())
                .mobileNumber(saved.getMobileNumber())
                .ownerStatus(saved.getStatus())
                .build();

    }

    @Transactional
    @Override
    public void updateOwner(UpdateSareeOwnerRequestDto requestDto) {
        SareeOwner sareeOwner = sareeOwnerRepository.findById(requestDto.getOwnerId()).orElseThrow(() -> new ResourceNotFoundException("Saree Owner not found"));

        if (!sareeOwner.getMobileNumber().equals(requestDto.getMobileNumber()) && sareeOwnerRepository.existsByMobileNumber(requestDto.getMobileNumber())){
            throw new DuplicateResourceException("Mobile number already in use");
        }
        sareeOwner.setOwnerName(requestDto.getOwnerName());
        sareeOwner.setMobileNumber(requestDto.getMobileNumber());
        sareeOwnerRepository.save(sareeOwner);
    }

    @Override
    public SareeOwnerResponseDto getOwnerById(Long ownerId) {
        SareeOwner sareeOwner = sareeOwnerRepository.findById(ownerId).orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        return SareeOwnerResponseDto.builder()
                .ownerId(sareeOwner.getId())
                .ownerName(sareeOwner.getOwnerName())
                .mobileNumber(sareeOwner.getMobileNumber())
                .ownerStatus(sareeOwner.getStatus())
                .build();
    }

    @Transactional
    @Override
    public void updateOwnerStatus(OwnerStatusUpdateDto requestDto) {
        SareeOwner owner = sareeOwnerRepository.findById(requestDto.getOwnerId()).orElseThrow(() -> new ResourceNotFoundException("Owner Not Found"));
        owner.setStatus(requestDto.getStatus());
        sareeOwnerRepository.save(owner);
    }


    @Override
    public PaginationResponseDto<SareeOwnerListDto> getOwnerList(PaginationRequestDto paginationRequestDto) {
        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                paginationRequestDto.getSortBy()
        );

        Page<SareeOwner> page = sareeOwnerRepository.findAll(pageRequest);

        List<SareeOwnerListDto> content = page.getContent()
                .stream()
                .map(sareeOwner -> SareeOwnerListDto.builder()
                        .ownerId(sareeOwner.getId())
                        .ownerName(sareeOwner.getOwnerName())
                        .mobileNumber(sareeOwner.getMobileNumber())
                        .ownerStatus(sareeOwner.getStatus())
                        .build())
                .collect(Collectors.toList());

        return PaginationResponseDto.<SareeOwnerListDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public SareeOwnerResponseDto getMyProfile() {
        Long ownerId = CurrentUserUtil.getOwnerId();
        if (ownerId == null){
            throw new RuntimeException("Access Denied");
        }

        SareeOwner sareeOwner = sareeOwnerRepository.findById(ownerId).orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        return SareeOwnerResponseDto.builder()
                .ownerId(sareeOwner.getId())
                .ownerName(sareeOwner.getOwnerName())
                .mobileNumber(sareeOwner.getMobileNumber())
                .ownerStatus(sareeOwner.getStatus())
                .build();
    }
}
