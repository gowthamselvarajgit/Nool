package com.nool.backend.repository.employee;

import com.nool.backend.entity.employee.Attendance;
import com.nool.backend.enums.AttendanceStatus;
import org.springframework.cglib.core.Local;
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
}
