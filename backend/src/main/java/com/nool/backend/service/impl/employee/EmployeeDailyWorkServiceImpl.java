package com.nool.backend.service.impl.employee;

import com.nool.backend.auth.security.CurrentUserUtil;
import com.nool.backend.dto.common.DateRangeDto;
import com.nool.backend.dto.common.PaginationRequestDto;
import com.nool.backend.dto.common.PaginationResponseDto;
import com.nool.backend.dto.dailywork.EmployeeDailyWorkListDto;
import com.nool.backend.dto.dailywork.EmployeeDailyWorkRequestDto;
import com.nool.backend.dto.dailywork.EmployeeDailyWorkResponseDto;
import com.nool.backend.dto.dailywork.EmployeeWorkSummaryDto;
import com.nool.backend.entity.employee.Employee;
import com.nool.backend.entity.employee.EmployeeDailyWork;
import com.nool.backend.exception.ResourceNotFoundException;
import com.nool.backend.repository.employee.EmployeeDailyWorkRepository;
import com.nool.backend.repository.employee.EmployeeRepository;
import com.nool.backend.service.employee.EmployeeDailyWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeDailyWorkServiceImpl implements EmployeeDailyWorkService {
    private final EmployeeDailyWorkRepository employeeDailyWorkRepository;
    private final EmployeeRepository employeeRepository;

    private EmployeeDailyWorkListDto mapToListDto(EmployeeDailyWork employeeDailyWork) {
        return EmployeeDailyWorkListDto.builder()
                .workId(employeeDailyWork.getId())
                .employeeId(employeeDailyWork.getEmployee().getId())
                .employeeName(employeeDailyWork.getEmployee().getName())
                .workDate(employeeDailyWork.getWorkDate())
                .freshCount(employeeDailyWork.getFreshCount())
                .rePolishCount(employeeDailyWork.getRePolishCount())
                .todayEarning(employeeDailyWork.getFreshCount() * employeeDailyWork.getEmployee().getPolishRate())
                .build();
    }


    @Override
    public EmployeeDailyWorkResponseDto addDailyWork(EmployeeDailyWorkRequestDto requestDto) {
        Employee employee = employeeRepository.findById(requestDto.getEmployeeId()).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        EmployeeDailyWork employeeDailyWork = EmployeeDailyWork.builder()
                .employee(employee)
                .workDate(requestDto.getWorkDate())
                .freshCount(requestDto.getFreshCount())
                .rePolishCount(requestDto.getRePolishCount())
                .build();

        EmployeeDailyWork saved = employeeDailyWorkRepository.save(employeeDailyWork);
        double  todayEarning = saved.getFreshCount() * employee.getPolishRate();
        return EmployeeDailyWorkResponseDto.builder()
                .workId(saved.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .workDate(saved.getWorkDate())
                .freshCount(saved.getFreshCount())
                .rePolishCount(saved.getRePolishCount())
                .todayRevenue(todayEarning)
                .build();
    }

    @Override
    public PaginationResponseDto<EmployeeDailyWorkListDto> getDailyWorkList(PaginationRequestDto paginationRequestDto) {

        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(
                        paginationRequestDto
                                .getSortingDirection()
                ),
                paginationRequestDto.getSortBy());

        Page<EmployeeDailyWork> page = employeeDailyWorkRepository.findAll(pageRequest);

        List<EmployeeDailyWorkListDto> content = page
                .getContent()
                .stream()
                .map(this::mapToListDto)
                .collect(Collectors.toList());
        return PaginationResponseDto.<EmployeeDailyWorkListDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public PaginationResponseDto<EmployeeDailyWorkListDto> getMyDailyWorkList(PaginationRequestDto paginationRequestDto) {
        Long employeeId = CurrentUserUtil.getEmployeeId();
        if (employeeId == null){
            throw new RuntimeException("Access denied");
        }

        PageRequest pageRequest = PageRequest.of(
                paginationRequestDto.getPage(),
                paginationRequestDto.getSize(),
                Sort.Direction.valueOf(paginationRequestDto.getSortingDirection()),
                paginationRequestDto.getSortBy()
        );

        Page<EmployeeDailyWork> page = employeeDailyWorkRepository.findByEmployeeId(employeeId, pageRequest);
        List<EmployeeDailyWorkListDto> content = page.getContent()
                .stream()
                .map(this::mapToListDto)
                .collect(Collectors.toList());

        return PaginationResponseDto.<EmployeeDailyWorkListDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public EmployeeWorkSummaryDto getEmployeeWorkSummary(Long employeeId, DateRangeDto dateRangeDto) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        List<EmployeeDailyWork> works = employeeDailyWorkRepository.findByEmployeeIdAndWorkDateBetween(employeeId, dateRangeDto.getFromDate(), dateRangeDto.getToDate());

        long totalWorkDays = works.size();
        long totalFresh = works.stream()
                .mapToLong(EmployeeDailyWork::getFreshCount)
                .sum();

        long totalRePolish = works.stream()
                .mapToLong(EmployeeDailyWork::getRePolishCount)
                .sum();

        double totalRevenue = totalFresh * employee.getPolishRate();
        return EmployeeWorkSummaryDto.builder()
                .employeeId(employeeId)
                .employeeName(employee.getName())
                .totalWorkDays(totalWorkDays)
                .totalFreshCount(totalFresh)
                .totalRePolishCount(totalRePolish)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Override
    public EmployeeWorkSummaryDto getMyWorkSummary(DateRangeDto dateRangeDto) {
        Long employeeId = CurrentUserUtil.getEmployeeId();
        if (employeeId == null){
            throw new RuntimeException("Access denied");
        }

        return getEmployeeWorkSummary(employeeId, dateRangeDto);
    }
}
