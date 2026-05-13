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
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "employee")
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
           SELECT COALESCE(SUM(s.amountPaid), 0)
           FROM SalaryPayment s
           WHERE s.paymentDate BETWEEN :fromDate AND :toDate
           """)
    Double sumTotalSalaryPaidByDateRange(LocalDate fromDate, LocalDate toDate);

    @Query("""
           SELECT COALESCE(SUM(s.amountPaid), 0)
           FROM SalaryPayment s
           WHERE s.employee.id = :employeeId
             AND s.paymentDate BETWEEN :fromDate AND :toDate
           """)
    Double sumTotalSalaryPaidByEmployeeAndDateRange(Long employeeId, LocalDate fromDate, LocalDate toDate);


    @Query("""
           SELECT MAX(s.paymentDate)
           FROM SalaryPayment s
           WHERE s.employee.id = :employeeId
           """)
    LocalDate findLastPaymentDateByEmployee(Long employeeId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM SalaryPayment s WHERE s.employee.id = :employeeId")
    int deleteAllByEmployeeId(Long employeeId);

    // All-time per-employee paid sums.
    @Query("""
           SELECT s.employee.id, COALESCE(SUM(s.amountPaid), 0)
           FROM SalaryPayment s
           GROUP BY s.employee.id
           """)
    List<Object[]> sumPaidByAllEmployees();
}
