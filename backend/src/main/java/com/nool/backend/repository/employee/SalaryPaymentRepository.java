package com.nool.backend.repository.employee;

import com.nool.backend.entity.employee.SalaryPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalaryPaymentRepository extends JpaRepository<SalaryPayment, Long> {
    List<SalaryPayment> findByEmployeeId(Long employeeId);
    List<SalaryPayment> findByPaymentDateBetween(LocalDate fromDate, LocalDate toDate);

    @Query("SELECT SUM(s.amountPaid) FROM SalaryPayment s WHERE s.employee.id = :employeeId")
    Double sumTotalSalaryPaidByEmployee(Long employeeId);
}
