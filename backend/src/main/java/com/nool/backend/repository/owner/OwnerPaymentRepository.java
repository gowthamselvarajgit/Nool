package com.nool.backend.repository.owner;

import com.nool.backend.entity.owner.OwnerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OwnerPaymentRepository extends JpaRepository<OwnerPayment, Long> {
    List<OwnerPayment> findByOwnerId(Long ownerId);
    List<OwnerPayment> findByPaymentDateBetween(LocalDate fromDate, LocalDate toDate);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM OwnerPayment p WHERE p.owner.id = :ownerId")
    Double sumTotalAmountPaidByOwner(Long ownerId);

}
