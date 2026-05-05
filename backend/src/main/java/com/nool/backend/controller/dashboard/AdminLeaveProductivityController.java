package com.nool.backend.controller.dashboard;

import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.dashboard.admin.AdminEmployeeLeaveProductivityDto;
import com.nool.backend.dto.dashboard.admin.AdminLeaveProductivitySummary;
import com.nool.backend.service.dashboard.AdminLeaveProductivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/leave-productivity")
@RequiredArgsConstructor
public class AdminLeaveProductivityController {
    private final AdminLeaveProductivityService adminLeaveProductivityService;

    @PostMapping("/employees")
    public List<AdminEmployeeLeaveProductivityDto> getEmployeeLeaveProductivity(@Valid @RequestBody DateRangeDto dateRangeDto){
        return adminLeaveProductivityService.getEmployeeLeaveProductivity(dateRangeDto);
    }

    @PostMapping("/summary")
    public AdminLeaveProductivitySummary getLeaveProductivitySummary(@Valid @RequestBody DateRangeDto dateRangeDto){
        return adminLeaveProductivityService.getLeaveProductivitySummary(dateRangeDto);
    }
}
