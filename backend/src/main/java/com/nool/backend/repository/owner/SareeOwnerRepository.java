package com.nool.backend.repository.owner;

import com.nool.backend.entity.owner.SareeOwner;
import com.nool.backend.enums.OwnerStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SareeOwnerRepository extends JpaRepository<SareeOwner, Long> {

    List<SareeOwner> findByStatus(OwnerStatus status);

    boolean existsByMobileNumber(String mobileNumber);

    @Query("SELECT o FROM SareeOwner o WHERE " +
            "LOWER(o.ownerName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "o.mobileNumber LIKE CONCAT('%', :keyword, '%')")
    Page<SareeOwner> searchOwners(@Param("keyword") String keyword, Pageable pageable);

    // Acquires SELECT ... FOR UPDATE on the owner row.
    // Why: every receipt/return for an owner must serialize so two concurrent
    // requests cannot both pass the in-hand validation against the same prior state.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM SareeOwner o WHERE o.id = :id")
    Optional<SareeOwner> findByIdForUpdate(@Param("id") Long id);
}