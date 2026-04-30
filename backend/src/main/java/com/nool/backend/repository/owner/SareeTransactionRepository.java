package com.nool.backend.repository.owner;

import com.nool.backend.entity.owner.SareeTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SareeTransactionRepository extends JpaRepository<SareeTransaction, Long> {
    Page<SareeTransaction> findBySareeOwnerId(Long ownerId, Pageable pageable);
    List<SareeTransaction> findBySareeOwnerIdAndReceivedDateBetween(Long ownerId, LocalDate fromDate, LocalDate toDate);
    List<SareeTransaction> findBySareeOwnerIdAndReturnedDateBetween(Long ownerId, LocalDate fromDate, LocalDate toDate);


    @Query("""
           SELECT COALESCE(SUM(t.receivedQuantity), 0)
           FROM SareeTransaction t
           WHERE t.receivedDate BETWEEN :fromDate AND :toDate
           """)
    Long sumTotalReceived(LocalDate fromDate, LocalDate toDate);

    @Query("""
           SELECT COALESCE(SUM(t.returnedQuantity), 0)
           FROM SareeTransaction t
           WHERE t.returnedDate BETWEEN :fromDate AND :toDate
           """)
    Long sumTotalReturned(LocalDate fromDate, LocalDate toDate);


}
