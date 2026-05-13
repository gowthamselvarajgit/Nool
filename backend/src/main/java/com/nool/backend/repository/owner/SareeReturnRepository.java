package com.nool.backend.repository.owner;

import com.nool.backend.entity.owner.SareeReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SareeReturnRepository extends JpaRepository<SareeReturn, Long> {

    List<SareeReturn> findByTransaction_IdOrderByReturnedDateAsc(Long transactionId);

    @Query("SELECT COALESCE(SUM(r.returnedQuantity), 0) FROM SareeReturn r WHERE r.transaction.id = :txId")
    long sumReturnedByTransactionId(@Param("txId") Long transactionId);

    @Query("""
           SELECT COALESCE(SUM(r.returnedQuantity), 0)
           FROM SareeReturn r
           WHERE r.returnedDate BETWEEN :fromDate AND :toDate
           """)
    Long sumReturnedByDateRange(LocalDate fromDate, LocalDate toDate);

    @Query("""
           SELECT COALESCE(SUM(r.returnedQuantity), 0)
           FROM SareeReturn r
           WHERE r.transaction.sareeOwner.id = :ownerId
             AND r.returnedDate BETWEEN :fromDate AND :toDate
           """)
    Long sumReturnedByOwnerAndDateRange(Long ownerId, LocalDate fromDate, LocalDate toDate);

    @Query("""
           SELECT COALESCE(SUM(r.returnedQuantity), 0)
           FROM SareeReturn r
           WHERE r.transaction.sareeOwner.id = :ownerId
           """)
    Long sumReturnedByOwner(Long ownerId);
}
