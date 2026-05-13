package com.nool.backend.repository.employee;

import com.nool.backend.entity.employee.Attendance;
import com.nool.backend.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    long countByAttendanceDateAndAttendanceStatus(
            LocalDate attendanceDate,
            AttendanceStatus attendanceStatus
    );

    List<Attendance> findByEmployeeIdAndAttendanceDateBetween(
            Long employeeId,
            LocalDate fromDate,
            LocalDate toDate
    );

    boolean existsByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "employee")
    Page<Attendance> findByEmployeeId(Long employeeId, Pageable pageable);

    @Query("""
           SELECT COUNT(a)
           FROM Attendance a
           WHERE a.employee.id = :employeeId
             AND a.attendanceStatus = :status
           """)
    long countPresentDaysByEmployee(
            Long employeeId,
            AttendanceStatus status
    );

    long countByEmployeeIdAndAttendanceDateBetweenAndAttendanceStatus(
            Long employeeId,
            LocalDate fromDate,
            LocalDate toDate,
            AttendanceStatus attendanceStatus
    );

    List<Attendance> findByEmployeeIdAndAttendanceDateBetweenAndAttendanceStatus(
            Long employeeId,
            LocalDate fromDate,
            LocalDate toDate,
            AttendanceStatus attendanceStatus
    );

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Attendance a WHERE a.employee.id = :employeeId")
    int deleteAllByEmployeeId(Long employeeId);

    // Aggregate counts per employee+status for a date range — used by leave-productivity.
    @Query("""
           SELECT a.employee.id, a.attendanceStatus, COUNT(a)
           FROM Attendance a
           WHERE a.attendanceDate BETWEEN :fromDate AND :toDate
           GROUP BY a.employee.id, a.attendanceStatus
           """)
    List<Object[]> aggregateByEmployeeAndStatus(LocalDate fromDate, LocalDate toDate);

    // Single-row count by status for a date range (no employee grouping)
    @Query("""
           SELECT COUNT(a)
           FROM Attendance a
           WHERE a.attendanceDate BETWEEN :fromDate AND :toDate
             AND a.attendanceStatus = :status
           """)
    long countByDateRangeAndStatus(LocalDate fromDate, LocalDate toDate, AttendanceStatus status);

    // All rows of a particular status in range, for grouping absent-dates per employee
    @Query("""
           SELECT a FROM Attendance a
           WHERE a.attendanceDate BETWEEN :fromDate AND :toDate
             AND a.attendanceStatus = :status
           """)
    List<Attendance> findByDateRangeAndStatus(LocalDate fromDate, LocalDate toDate, AttendanceStatus status);
}
