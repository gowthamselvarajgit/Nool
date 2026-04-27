package com.nool.backend.repository.owner;

import com.nool.backend.entity.owner.SareeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SareeTransactionRepository extends JpaRepository<SareeTransaction, Long> {
    List<SareeTransaction> findByOwnerId(Long ownerId);
    List<SareeTransaction> findByTransactionDateBetween(LocalDate fromDate, LocalDate toDate);

    @Query("SELECT COALESCE(SUM(t.receivedCount), 0) FROM SareeTransaction t")
    Long sumTotalReceivedSarees();


    @Query("SELECT COALESCE(SUM(t.returnedCount), 0) FROM SareeTransaction t")
    Long sumTotalReturnedSarees();

}
