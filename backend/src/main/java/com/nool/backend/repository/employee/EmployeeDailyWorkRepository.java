package com.nool.backend.repository.employee;

import com.nool.backend.entity.employee.EmployeeDailyWork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeDailyWorkRepository extends JpaRepository<EmployeeDailyWork, Long> {

    List<EmployeeDailyWork> findByEmployeeId(Long employeeId);
    List<EmployeeDailyWork> findByWorkDate(LocalDate workDate);

    @Query("SELECT SUM(w.freshCount) FROM EmployeeDailyWork w WHERE w.workDate = :workDate")
    Long sumFreshWorkByDate(LocalDate workDate);

    @Query("SELECT SUM(w.rePolishCount) FROM EmployeeDailyWork w WHERE w.workDate = :workDate")
    Long sumRePolishWorkByDate(LocalDate wordDate);
}
