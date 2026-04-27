package com.nool.backend.repository.owner;

import com.nool.backend.entity.owner.SareeOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SareeOwnerRepository extends JpaRepository<SareeOwner, Long> {
    List<SareeOwner> findByActiveTrue();

    List<SareeOwner> findByActiveFalse();
}
