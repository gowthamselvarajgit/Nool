package com.nool.backend.repository.owner;

import com.nool.backend.entity.owner.SareeLedgerEntry;
import com.nool.backend.enums.LedgerEntryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SareeLedgerRepository extends JpaRepository<SareeLedgerEntry, Long> {

    @EntityGraph(attributePaths = "sareeOwner")
    Page<SareeLedgerEntry> findBySareeOwnerId(Long ownerId, Pageable pageable);

    @EntityGraph(attributePaths = "sareeOwner")
    Page<SareeLedgerEntry> findAllBy(Pageable pageable);

    @Query("""
           SELECT COALESCE(SUM(e.quantity), 0)
           FROM SareeLedgerEntry e
           WHERE e.sareeOwner.id = :ownerId
             AND e.entryType = :type
           """)
    Long sumQuantityByOwnerAndType(Long ownerId, LedgerEntryType type);

    @Query("""
           SELECT COALESCE(SUM(e.quantity), 0)
           FROM SareeLedgerEntry e
           WHERE e.sareeOwner.id = :ownerId
             AND e.entryType = :type
             AND e.entryDate BETWEEN :fromDate AND :toDate
           """)
    Long sumQuantityByOwnerAndTypeAndDateRange(
            Long ownerId,
            LedgerEntryType type,
            LocalDate fromDate,
            LocalDate toDate
    );

    @Query("""
           SELECT COALESCE(SUM(e.quantity), 0)
           FROM SareeLedgerEntry e
           WHERE e.entryType = :type
             AND e.entryDate BETWEEN :fromDate AND :toDate
           """)
    Long sumQuantityByTypeAndDateRange(
            LedgerEntryType type,
            LocalDate fromDate,
            LocalDate toDate
    );

    @Query("""
           SELECT COALESCE(SUM(e.quantity), 0)
           FROM SareeLedgerEntry e
           WHERE e.entryType = :type
           """)
    Long sumQuantityByType(LedgerEntryType type);

    @Query("""
           SELECT e.sareeOwner.id, e.entryType, COALESCE(SUM(e.quantity), 0)
           FROM SareeLedgerEntry e
           GROUP BY e.sareeOwner.id, e.entryType
           """)
    List<Object[]> aggregateAllOwnersByType();

    @EntityGraph(attributePaths = "sareeOwner")
    List<SareeLedgerEntry> findBySareeOwnerIdOrderByEntryDateDescIdDesc(Long ownerId);
}
