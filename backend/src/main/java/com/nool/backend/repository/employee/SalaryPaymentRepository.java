package com.nool.backend.repository.employee;

import com.nool.backend.entity.employee.SalaryPayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalaryPaymentRepository extends JpaRepository<SalaryPayment, Long> {
    Page<SalaryPayment> findByEmployeeId(Long employeeId, Pageable pageable);

    List<SalaryPayment> findByPaymentDateBetween(LocalDate fromDate, LocalDate toDate);

    @Query("""
            SELECT COALESCE(SUM(s.amountPaid), 0)
            FROM SalaryPayment s
            """)
    Double sumTotalSalaryPaid();

    @Query("""
           SELECT COALESCE(SUM(s.amountPaid), 0)
           FROM SalaryPayment s
           WHERE s.employee.id = :employeeId
           """)
    Double sumTotalSalaryPaidByEmployee(Long employeeId);


    @Query("""
           SELECT MAX(s.paymentDate)
           FROM SalaryPayment s
           WHERE s.employee.id = :employeeId
           """)
    LocalDate findLastPaymentDateByEmployee(Long employeeId);

}