package com.nool.backend.service.impl.owner;

import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.owner.CreateSareeOwnerRequestDto;
import com.nool.backend.dto.owner.SareeOwnerListDto;
import com.nool.backend.dto.owner.SareeOwnerResponseDto;
import com.nool.backend.dto.owner.UpdateSareeOwnerRequestDto;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.repository.owner.SareeOwnerRepository;
import com.nool.backend.service.owner.SareeOwnerService;
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
    public void createOwner(CreateSareeOwnerRequestDto requestDto) {
        SareeOwner sareeOwner = SareeOwner.builder()
                .ownerName(requestDto.getOwnerName())
                .mobileNumber(requestDto.getMobileNumber())
                .active(true)
                .build();

        sareeOwnerRepository.save(sareeOwner);
    }

    @Override
    public void updateOwner(UpdateSareeOwnerRequestDto requestDto) {
        SareeOwner sareeOwner = sareeOwnerRepository.findById(requestDto.getOwnerId()).orElseThrow(() -> new RuntimeException("Saree Owner not found"));
        sareeOwner.setOwnerName(requestDto.getOwnerName());
        sareeOwner.setMobileNumber(requestDto.getMobileNumber());
        sareeOwnerRepository.save(sareeOwner);
    }

    @Override
    public SareeOwnerResponseDto getOwnerById(Long ownerId) {
        SareeOwner sareeOwner = sareeOwnerRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("Owner not found"));
        return SareeOwnerResponseDto.builder()
                .ownerId(sareeOwner.getId())
                .ownerName(sareeOwner.getOwnerName())
                .mobileNumber(sareeOwner.getMobileNumber())
                .status(sareeOwner.isActive() ? "ACTIVE" : "INACTIVE")
                .build();
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
                        .status(sareeOwner.isActive() ? "ACTIVE" : "INACTIVE")
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
}
