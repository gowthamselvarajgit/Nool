package com.nool.backend.entity.owner;

import com.nool.backend.enums.PaymentMode;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "owner_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "amount_received", nullable = false)
    private Double amountPaid;

    /**
     * Signed change to the owner's advance balance on this row.
     *   Positive  → owner gave extra money (workshop holds advance from owner)
     *   Negative  → admin is applying a previous advance to settle a new bill
     *   Null / 0  → plain payment, no advance movement (default for legacy rows)
     *
     * Settled-bill amount for the row = amountPaid - advanceAmount
     * Owner's running advance balance = SUM(COALESCE(advanceAmount, 0))
     */
    @Column(name = "advance_amount")
    private Double advanceAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false)
    private PaymentMode paymentMode;

    @Column(name = "remarks")
    private String remarks;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private SareeOwner owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate(){
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate(){
        this.updatedAt = LocalDateTime.now();
    }
}
