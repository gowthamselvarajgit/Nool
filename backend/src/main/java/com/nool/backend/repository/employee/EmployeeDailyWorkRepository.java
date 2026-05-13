package com.nool.backend.repository.employee;

import com.nool.backend.entity.employee.EmployeeDailyWork;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeDailyWorkRepository
        extends JpaRepository<EmployeeDailyWork, Long> {

    List<EmployeeDailyWork> findByEmployeeId(Long employeeId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "employee")
    Page<EmployeeDailyWork> findByEmployeeId(Long employeeId, Pageable pageable);

    List<EmployeeDailyWork> findByWorkDate(LocalDate workDate);

    List<EmployeeDailyWork> findByWorkDateBetween(LocalDate fromDate, LocalDate toDate);

    List<EmployeeDailyWork> findByEmployeeIdAndWorkDateBetween(
            Long employeeId,
            LocalDate fromDate,
            LocalDate toDate
    );

    @Query("""
           SELECT COALESCE(SUM(w.freshCount), 0)
           FROM EmployeeDailyWork w
           WHERE w.workDate = :workDate
           """)
    Long sumFreshWorkByDate(LocalDate workDate);

    @Query("""
           SELECT COALESCE(SUM(w.rePolishCount), 0)
           FROM EmployeeDailyWork w
           WHERE w.workDate = :workDate
           """)
    Long sumRePolishWorkByDate(LocalDate workDate);

    @Query("""
           SELECT COALESCE(SUM(w.freshCount), 0)
           FROM EmployeeDailyWork w
           WHERE w.workDate BETWEEN :fromDate AND :toDate
           """)
    Long sumFreshWorkByDateRange(
            LocalDate fromDate,
            LocalDate toDate
    );

    @Query("""
           SELECT COALESCE(SUM(w.rePolishCount), 0)
           FROM EmployeeDailyWork w
           WHERE w.workDate BETWEEN :fromDate AND :toDate
           """)
    Long sumRePolishWorkByDateRange(
            LocalDate fromDate,
            LocalDate toDate
    );

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM EmployeeDailyWork w WHERE w.employee.id = :employeeId")
    int deleteAllByEmployeeId(Long employeeId);

    // Per-employee aggregate for a date range (fresh, repolish, distinct workdays).
    @Query("""
           SELECT w.employee.id,
                  COALESCE(SUM(w.freshCount), 0),
                  COALESCE(SUM(w.rePolishCount), 0),
                  COUNT(DISTINCT w.workDate)
           FROM EmployeeDailyWork w
           WHERE w.workDate BETWEEN :fromDate AND :toDate
           GROUP BY w.employee.id
           """)
    List<Object[]> aggregateByEmployee(LocalDate fromDate, LocalDate toDate);

    // All-time per-employee fresh + repolish totals.
    @Query("""
           SELECT w.employee.id,
                  COALESCE(SUM(w.freshCount), 0),
                  COALESCE(SUM(w.rePolishCount), 0)
           FROM EmployeeDailyWork w
           GROUP BY w.employee.id
           """)
    List<Object[]> aggregateByAllEmployees();
}
