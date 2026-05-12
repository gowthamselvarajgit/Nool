package com.nool.backend.entity.owner;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "saree_returns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SareeReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "return_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "transaction_id", nullable = false)
    private SareeTransaction transaction;

    @Column(name = "returned_date", nullable = false)
    private LocalDate returnedDate;

    @Column(name = "returned_quantity", nullable = false)
    private Integer returnedQuantity;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
