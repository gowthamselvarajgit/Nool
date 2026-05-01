package com.nool.backend.service.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.admin.AdminEmployeeLeaveProductivityDto;
import com.nool.backend.dto.dashboard.admin.AdminLeaveProductivitySummary;

import java.util.List;

public interface AdminLeaveProductivityService {

    List<AdminEmployeeLeaveProductivityDto> getEmployeeLeaveProductivity(
            DateRangeDto dateRangeDto
    );

    AdminLeaveProductivitySummary getLeaveProductivitySummary(DateRangeDto dateRangeDto);

}
