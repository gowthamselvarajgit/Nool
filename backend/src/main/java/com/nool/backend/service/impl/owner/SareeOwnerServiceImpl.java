package com.nool.backend.service.impl.owner;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.auth.entity.User;
import com.nool.backend.auth.entity.UserProfile;
import com.nool.backend.auth.service.AdminUserService;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.owner.*;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.enums.OwnerStatus;
import com.nool.backend.exception.DuplicateResourceException;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.owner.SareeOwnerRepository;
import com.nool.backend.repository.auth.UserRepository;
import com.nool.backend.repository.auth.UserProfileRepository;
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
    private final AdminUserService adminUserService;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    @Override
    @Transactional
    public SareeOwnerResponseDto createOwner(CreateSareeOwnerRequestDto requestDto) {
        String mobile = requestDto.getMobileNumber();

        if (sareeOwnerRepository.existsByMobileNumber(mobile)) {
            throw new DuplicateResourceException("Owner with this mobile number already exists");
        }

        // Clean up any orphan login account (no linked employee/owner) so a retry
        // after a previously-failed create doesn't get blocked by a stale row.
        userRepository.findByMobileNumber(mobile).ifPresent(existingUser -> {
            UserProfile profile = userProfileRepository.findByUserId(existingUser.getId()).orElse(null);
            boolean linkedToSomething = profile != null
                    && (profile.getEmployeeId() != null || profile.getOwnerId() != null);
            boolean isAdmin = existingUser.getRole() != null
                    && existingUser.getRole().name().equals("ADMIN");
            if (linkedToSomething || isAdmin) {
                throw new DuplicateResourceException("This mobile number is already in use by another account");
            }
            if (profile != null) {
                userProfileRepository.delete(profile);
            }
            userRepository.delete(existingUser);
            userRepository.flush();
        });

        SareeOwner sareeOwner = SareeOwner.builder()
                .ownerName(requestDto.getOwnerName())
                .mobileNumber(mobile)
                .status(OwnerStatus.ACTIVE)
                .build();

        SareeOwner saved = sareeOwnerRepository.save(sareeOwner);

        // Create associated user account with login credentials
        User user = adminUserService.createOwnerUser(
            mobile,
            requestDto.getPassword(),
            saved.getId()
        );
        saved.setUser(user);
        saved = sareeOwnerRepository.save(saved);

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
        if (!sareeOwner.getMobileNumber().equals(requestDto.getMobileNumber()) && userRepository.existsByMobileNumber(requestDto.getMobileNumber())) {
            throw new DuplicateResourceException("A login account with this mobile number already exists");
        }
        sareeOwner.setOwnerName(requestDto.getOwnerName());
        sareeOwner.setMobileNumber(requestDto.getMobileNumber());
        User user = sareeOwner.getUser();
        if (user == null) {
            user = userProfileRepository.findByOwnerId(sareeOwner.getId())
                    .map(profile -> profile.getUser())
                    .orElse(null);
        }
        if (user != null) {
            user.setMobileNumber(requestDto.getMobileNumber());
            userRepository.save(user);
            sareeOwner.setUser(user);
        }
        sareeOwnerRepository.save(sareeOwner);
    }

    @Override
    public SareeOwnerResponseDto getOwnerById(Long ownerId) {
        // A SAREE_OWNER can only read their own profile.
        String role = CurrentUserUtil.getRole();
        if (!"ADMIN".equals(role)) {
            Long callerOwnerId = CurrentUserUtil.getOwnerId();
            if (callerOwnerId == null || !callerOwnerId.equals(ownerId)) {
                throw new org.springframework.security.access.AccessDeniedException("You can only view your own profile");
            }
        }
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

        String keyword = paginationRequestDto.getSearchKeyword();
        Page<SareeOwner> page = (keyword != null && !keyword.isBlank())
                ? sareeOwnerRepository.searchOwners(keyword, pageRequest)
                : sareeOwnerRepository.findAll(pageRequest);

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
