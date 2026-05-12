package com.nool.backend.repository.owner;

import com.nool.backend.entity.owner.SareeReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SareeReturnRepository extends JpaRepository<SareeReturn, Long> {

    List<SareeReturn> findByTransaction_IdOrderByReturnedDateAsc(Long transactionId);

    @Query("SELECT COALESCE(SUM(r.returnedQuantity), 0) FROM SareeReturn r WHERE r.transaction.id = :txId")
    long sumReturnedByTransactionId(@Param("txId") Long transactionId);
}
