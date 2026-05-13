package com.nool.backend.service.impl.dashboard;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.owner.OwnerDashboardSummaryDto;
import com.nool.backend.dto.dashboard.owner.OwnerInventoryAnalyticsDto;
import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.owner.OwnerPaymentRepository;
import com.nool.backend.repository.owner.SareeReturnRepository;
import com.nool.backend.repository.owner.SareeOwnerRepository;
import com.nool.backend.repository.owner.SareeTransactionRepository;
import com.nool.backend.service.dashboard.OwnerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class OwnerDashboardServiceImpl implements OwnerDashboardService {
    private static final double RATE_PER_SAREE = 70.0;

    private final SareeOwnerRepository sareeOwnerRepository;
    private final SareeTransactionRepository sareeTransactionRepository;
    private final OwnerPaymentRepository ownerPaymentRepository;
    private final SareeReturnRepository sareeReturnRepository;


    @Override
    public OwnerDashboardSummaryDto getDashboardSummary(Long ownerId, DateRangeDto dateRangeDto) {
        SareeOwner sareeOwner = sareeOwnerRepository.findById(ownerId).orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        Long totalSareesGiven = sareeTransactionRepository.sumReceivedByOwnerAndDateRange(ownerId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());
        Long totalSareesReturned = sareeReturnRepository.sumReturnedByOwnerAndDateRange(ownerId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        long sareesInHand = totalSareesGiven - totalSareesReturned;

        double totalAmountPayable = totalSareesReturned * RATE_PER_SAREE;
        Double totalAmountPaidBoxed = ownerPaymentRepository.sumTotalAmountPaidByOwnerAndDateRange(
                ownerId,
                dateRangeDto.getFromDate(),
                dateRangeDto.getToDate()
        );
        double totalAmountPaid = totalAmountPaidBoxed == null ? 0.0 : totalAmountPaidBoxed;
        double pendingAmount = Math.max(totalAmountPayable - totalAmountPaid, 0);

        return OwnerDashboardSummaryDto.builder()
                .ownerId(ownerId)
                .ownerName(sareeOwner.getOwnerName())
                .totalSareesGiven(totalSareesGiven)
                .totalSareesReturned(totalSareesReturned)
                .sareesInHand(sareesInHand)
                .totalAmountPayable(totalAmountPayable)
                .totalAmountPaid(totalAmountPaid)
                .pendingAmount(pendingAmount)
                .build();
    }

    @Override
    public OwnerInventoryAnalyticsDto getInventoryAnalytics(Long ownerId, DateRangeDto dateRangeDto) {
        Long sareesGiven = sareeTransactionRepository.sumReceivedByOwnerAndDateRange(ownerId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());
        Long sareesReturned = sareeReturnRepository.sumReturnedByOwnerAndDateRange(ownerId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());
        long sareesInHand = sareesGiven - sareesReturned;
        return OwnerInventoryAnalyticsDto.builder()
                .date(LocalDate.now())
                .sareesGiven(sareesGiven)
                .sareesReturned(sareesReturned)
                .sareesInHand(sareesInHand)
                .build();
    }

    @Override
    public OwnerDashboardSummaryDto getMyDashboard(DateRangeDto dateRangeDto) {
        Long ownerId = CurrentUserUtil.getOwnerId();
        if (ownerId == null){
            throw new RuntimeException("Access Denied");
        }

        return getDashboardSummary(ownerId,dateRangeDto);
    }
}
