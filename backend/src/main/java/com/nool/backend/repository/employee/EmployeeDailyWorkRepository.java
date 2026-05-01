package com.nool.backend.repository.employee;

import com.nool.backend.entity.employee.EmployeeDailyWork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeDailyWorkRepository
        extends JpaRepository<EmployeeDailyWork, Long> {

    List<EmployeeDailyWork> findByEmployeeId(Long employeeId);

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
}