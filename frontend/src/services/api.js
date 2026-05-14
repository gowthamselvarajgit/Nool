// Use proxy path during development, absolute URL for production
const API_BASE_URL = '/api';

const getToken = () => localStorage.getItem('nool_token');

const headers = (token = null) => {
  const h = { 'Content-Type': 'application/json' };
  if (token || getToken()) {
    h['Authorization'] = `Bearer ${token || getToken()}`;
  }
  return h;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('nool_token');
    localStorage.removeItem('nool_user');
    window.location.href = '/login';
    return;
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authService = {
  login: async (mobileNumber, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ mobileNumber, password }),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: headers(),
    });
    return handleResponse(response);
  },

  validate: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// ─── Employee ────────────────────────────────────────────────────────────────
export const employeeService = {
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/employees/me`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },

  update: async (data) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateStatus: async (employeeId, status) => {
    const response = await fetch(`${API_BASE_URL}/employees/status`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ employeeId, status }),
    });
    return handleResponse(response);
  },

  getList: async (page = 0, size = 10, searchKeyword = '') => {
    const response = await fetch(`${API_BASE_URL}/employees/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, searchKeyword, sortBy: 'createdAt', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },

  delete: async (employeeId) => {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// ─── Attendance ──────────────────────────────────────────────────────────────
export const attendanceService = {
  // Backend: POST /attendance → { employeeId, attendanceDate, status }
  mark: async (data) => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        employeeId: data.employeeId,
        attendanceDate: data.attendanceDate,  // ✅ correct field name
        status: data.status,
      }),
    });
    return handleResponse(response);
  },

  markAttendance: async (data) => attendanceService.mark(data),

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },

  // Backend: POST /attendance/list → PaginationRequestDto
  getList: async (page = 0, size = 50, searchKeyword = '') => {
    const response = await fetch(`${API_BASE_URL}/attendance/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        page,
        size,
        searchKeyword,
        sortBy: 'attendanceDate',
        sortingDirection: 'DESC',
      }),
    });
    return handleResponse(response);
  },

  getMyList: async (page = 0, size = 50) => {
    const response = await fetch(`${API_BASE_URL}/attendance/my-list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        page,
        size,
        sortBy: 'attendanceDate',
        sortingDirection: 'DESC',
      }),
    });
    return handleResponse(response);
  },

  // Backend: POST /attendance/employee/{employeeId}/summary → { fromDate, toDate }
  getEmployeeSummary: async (employeeId, fromDate, toDate) => {
    const response = await fetch(
      `${API_BASE_URL}/attendance/employee/${employeeId}/summary`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
      }
    );
    return handleResponse(response);
  },

  // Backend: POST /attendance/summary → { fromDate, toDate }
  getMySummary: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/attendance/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
    });
    return handleResponse(response);
  },
};

// ─── Salary ──────────────────────────────────────────────────────────────────
export const salaryService = {
  // Backend: POST /salary-payments → SalaryPaymentRequestDto
  // { employeeId, fromDate, toDate, amountPaid, paymentDate, paymentMode, remarks }
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/salary-payments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Backend: POST /salary-payments/employee/{employeeId}/history → PaginationRequestDto
  getEmployeeHistory: async (employeeId, page = 0, size = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/salary-payments/employee/${employeeId}/history`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ page, size, sortBy: 'paymentDate', sortingDirection: 'DESC' }),
      }
    );
    return handleResponse(response);
  },

  // Backend: POST /salary-payments/employee/{employeeId}/summary → { fromDate, toDate }
  getEmployeeSummary: async (employeeId, fromDate, toDate) => {
    const response = await fetch(
      `${API_BASE_URL}/salary-payments/employee/${employeeId}/summary`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
      }
    );
    return handleResponse(response);
  },

  // Backend: POST /salary-payments/history → PaginationRequestDto (employee's own history)
  getMyHistory: async (page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/salary-payments/history`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, sortBy: 'paymentDate', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },

  // Backend: POST /salary-payments/summary → { fromDate, toDate }
  getMySummary: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/salary-payments/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
    });
    return handleResponse(response);
  },

  // Backend: GET /salary-payments/employees-summary → list of {employeeId, employeeName, totalEarnings, totalSalaryPaid, pendingSalary}
  getAllEmployeesSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/salary-payments/employees-summary`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardService = {
  // Backend: GET /admin/dashboard/summary
  getSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },

  // Backend: POST /admin/dashboard/revenue → { fromDate, toDate }
  getRevenueAnalytics: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/revenue`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
    });
    return handleResponse(response);
  },

  // Backend: POST /admin/dashboard/revenue/month → { month, year }
  getMonthlyRevenue: async (month, year) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/revenue/month`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ month, year }),
    });
    return handleResponse(response);
  },

  // Backend: POST /admin/dashboard/workforce → { fromDate, toDate }
  getWorkforceAnalytics: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/workforce`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
    });
    return handleResponse(response);
  },
};

// ─── Leave & Productivity ────────────────────────────────────────────────────
export const leaveProductivityService = {
  // Backend: POST /admin/leave-productivity/employees → { fromDate, toDate }
  getEmployeeLeaveProductivity: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/admin/leave-productivity/employees`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),
    });
    return handleResponse(response);
  },

  // Backend: POST /admin/leave-productivity/summary → { fromDate, toDate }
  getLeaveProductivitySummary: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/admin/leave-productivity/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),
    });
    return handleResponse(response);
  },
};

// ─── Saree Owner ─────────────────────────────────────────────────────────────
export const ownerService = {
  // Backend: POST /owners → { ownerName, mobileNumber, password, polishRatePerSaree? }
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/owners`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        ownerName: data.ownerName,
        mobileNumber: data.mobileNumber,
        password: data.password,
        polishRatePerSaree: data.polishRatePerSaree,
      }),
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/owners/me`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },

  // Backend: PUT /owners → { ownerId, ownerName, mobileNumber, polishRatePerSaree? }
  update: async (data) => {
    const response = await fetch(`${API_BASE_URL}/owners`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({
        ownerId: data.ownerId,
        ownerName: data.ownerName,
        mobileNumber: data.mobileNumber,
        polishRatePerSaree: data.polishRatePerSaree,
      }),
    });
    return handleResponse(response);
  },

  // Backend: PATCH /owners/status → { ownerId, status }
  updateStatus: async (ownerId, status) => {
    const response = await fetch(`${API_BASE_URL}/owners/status`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ ownerId, status }),  // DTO field is 'status', not 'ownerStatus'
    });
    return handleResponse(response);
  },

  // Backend: POST /owners/list → PaginationRequestDto
  getList: async (page = 0, size = 10, searchKeyword = '') => {
    const response = await fetch(`${API_BASE_URL}/owners/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, searchKeyword, sortBy: 'createdAt', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },
};

// ─── Saree Inventory (Ledger model: independent RECEIPT / RETURN entries) ────
export const inventoryService = {
  // POST /inventory/receipt → { ownerId, entryDate, quantity, remarks }
  addReceipt: async (data) => {
    const response = await fetch(`${API_BASE_URL}/inventory/receipt`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // POST /inventory/return → { ownerId, entryDate, quantity, remarks }
  addReturn: async (data) => {
    const response = await fetch(`${API_BASE_URL}/inventory/return`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // POST /inventory/owner/{ownerId}/ledger → PaginationRequestDto
  getOwnerLedger: async (ownerId, page = 0, size = 50) => {
    const response = await fetch(`${API_BASE_URL}/inventory/owner/${ownerId}/ledger`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, sortBy: 'entryDate', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },

  // POST /inventory/my-ledger → PaginationRequestDto
  getMyLedger: async (page = 0, size = 50) => {
    const response = await fetch(`${API_BASE_URL}/inventory/my-ledger`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, sortBy: 'entryDate', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },

  // POST /inventory/owner/{ownerId}/summary → { fromDate, toDate }
  getOwnerSummary: async (ownerId, fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/inventory/owner/${ownerId}/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),
    });
    return handleResponse(response);
  },

  // POST /inventory/summary → { fromDate, toDate }
  getOverallSummary: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/inventory/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),
    });
    return handleResponse(response);
  },

  // POST /inventory/my-summary → { fromDate, toDate }
  getMySummary: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/inventory/my-summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),
    });
    return handleResponse(response);
  },

  // GET /inventory/owners → list of OwnerInventorySummaryDto across all owners
  getAllOwnersInventory: async () => {
    const response = await fetch(`${API_BASE_URL}/inventory/owners`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },

  // DELETE /inventory/entry/{id} → delete a ledger entry (admin only)
  deleteEntry: async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/inventory/entry/${entryId}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// ─── Owner Payment ────────────────────────────────────────────────────────────
export const ownerPaymentService = {
  // Backend: POST /owner-payments → { ownerId, amountPaid, paymentMode, paymentDate, remarks }
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/owner-payments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Backend: POST /owner-payments/owner/{ownerId}/history → PaginationRequestDto
  getOwnerHistory: async (ownerId, page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/owner-payments/owner/${ownerId}/history`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, sortBy: 'paymentDate', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },

  // Backend: POST /owner-payments/owner/{ownerId}/summary → { fromDate, toDate }
  getOwnerSummary: async (ownerId, fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/owner-payments/owner/${ownerId}/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
    });
    return handleResponse(response);
  },

  // Backend: POST /owner-payments/history → PaginationRequestDto (my payments)
  getMyHistory: async (page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/owner-payments/history`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, sortBy: 'paymentDate', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },

  // Backend: POST /owner-payments/summary → { fromDate, toDate }
  getMySummary: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/owner-payments/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
    });
    return handleResponse(response);
  },

  // Backend: GET /owner-payments/owners-summary → list of {ownerId, ownerName, totalAmountPayable, totalAmountPaid, pendingAmount}
  getAllOwnersSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/owner-payments/owners-summary`, {
      method: 'GET',
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// ─── Daily Work ───────────────────────────────────────────────────────────────
export const dailyWorkService = {
  // Backend: POST /employee-daily-working → { employeeId, workDate, freshCount, rePolishCount }
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        employeeId: data.employeeId,
        workDate: data.workDate,
        freshCount: data.freshCount,
        rePolishCount: data.rePolishCount,
      }),
    });
    return handleResponse(response);
  },

  // Backend: POST /employee-daily-working/list → PaginationRequestDto
  getList: async (page = 0, size = 20, searchKeyword = '') => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, searchKeyword, sortBy: 'workDate', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },

  getMyList: async (page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working/my-list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page, size, sortBy: 'workDate', sortingDirection: 'DESC' }),
    });
    return handleResponse(response);
  },

  // Backend: POST /employee-daily-working/employee/{employeeId}/summary → { fromDate, toDate }
  getEmployeeSummary: async (employeeId, fromDate, toDate) => {
    const response = await fetch(
      `${API_BASE_URL}/employee-daily-working/employee/${employeeId}/summary`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
      }
    );
    return handleResponse(response);
  },

  // Backend: POST /employee-daily-working/summary → { fromDate, toDate } (my summary)
  getMyWorkSummary: async (fromDate, toDate) => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fromDate, toDate }),  // ✅ correct field names
    });
    return handleResponse(response);
  },
};
