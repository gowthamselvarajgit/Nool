package com.nool.backend.repository.employee;

import com.nool.backend.entity.employee.Employee;
import com.nool.backend.enums.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // find employee by status(Active / Inactive)
    List<Employee> findByStatus(EmployeeStatus status);

    //count employee by status
    long countByStatus(EmployeeStatus status);

    @Query("SELECT e FROM Employee e WHERE e.status = 'ACTIVE'")
    List<Employee> findAllActiveEmployees();

}
