// Use proxy path during development, absolute URL for production
const API_BASE_URL = '/api';

const getToken = () => localStorage.getItem('nool_token');

const headers = (token = null) => {
  const h = {
    'Content-Type': 'application/json',
  };
  if (token || getToken()) {
    h['Authorization'] = `Bearer ${token || getToken()}`;
  }
  return h;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Auto logout on 401nool_token
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
// Auth Services
export const authService = {
  login: async (mobileNumber, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ mobileNumber, password }),
    });

    return await handleResponse(response);
  },

  logout: async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: headers(),
    });
    return await handleResponse(response);
  },

  validate: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: headers(),
    });
    return await handleResponse(response);
  },
};

// Employee Services
export const employeeService = {
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    return await handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/employees/me`, {
      method: 'GET',
      headers: headers(),
    });
    return await handleResponse(response);
  },

  update: async (data) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  getList: async (pageNo = 0, pageSize = 10, searchKeyword = '') => {
    const response = await fetch(`${API_BASE_URL}/employees/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ pageNo, pageSize, searchKeyword }),
    });
    return await handleResponse(response);
  },
};

// Attendance Services
export const attendanceService = {
  mark: async (data) => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    return await handleResponse(response);
  },

  getList: async (filters) => {
    const response = await fetch(`${API_BASE_URL}/attendance/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(filters),
    });
    return await handleResponse(response);
  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/attendance/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    return await handleResponse(response);
  },

  getEmployeeSummary: async (employeeId, startDate, endDate) => {
    const response = await fetch(
      `${API_BASE_URL}/attendance/employee/${employeeId}/summary`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ startDate, endDate }),
      }
    );
    return await handleResponse(response);
  },
};

// Salary Services
export const salaryService = {
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/salary-payments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  getHistory: async (employeeId, startDate, endDate) => {
    const response = await fetch(
      `${API_BASE_URL}/salary-payments/employee/${employeeId}/history`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ startDate, endDate }),
      }
    );
    return await handleResponse(response);
  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/salary-payments/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    return await handleResponse(response);
  },

  getEmployeeSummary: async (employeeId, startDate, endDate) => {
    const response = await fetch(
      `${API_BASE_URL}/salary-payments/employee/${employeeId}/summary`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ startDate, endDate }),
      }
    );
    return await handleResponse(response);
  },
};

// Dashboard Services
export const dashboardService = {
  getSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
      method: 'GET',
      headers: headers(),
    });
        return await handleResponse(response);
  },

  getRevenueAnalytics: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/revenue`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
        return await handleResponse(response);
  },

  getMonthlyRevenue: async (month, year) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/revenue/month`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ month, year }),
    });
    return await handleResponse(response);
  },

  getWorkforceAnalytics: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/workforce`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    return await handleResponse(response);
  },
};

// Saree Owner Services
export const ownerService = {
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/owners`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
        return await handleResponse(response);

  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    return await handleResponse(response);

  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/owners/me`, {
      method: 'GET',
      headers: headers(),
    });
    return await handleResponse(response);

  },

  update: async (data) => {
    const response = await fetch(`${API_BASE_URL}/owners`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  getList: async (pageNo = 0, pageSize = 10, searchKeyword = '') => {
    const response = await fetch(`${API_BASE_URL}/owners/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ pageNo, pageSize, searchKeyword }),
    });
    return await handleResponse(response);

  },
};

// Saree Inventory Services
export const inventoryService = {
  createTransaction: async (data) => {
    const response = await fetch(`${API_BASE_URL}/inventory/transaction`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);

  },

  getTransactions: async (filters) => {
    const response = await fetch(`${API_BASE_URL}/inventory/transactions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(filters),
    });
    return await handleResponse(response);

  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/inventory/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    return await handleResponse(response);

  },

  getOwnerSummary: async (ownerId, startDate, endDate) => {
    const response = await fetch(
      `${API_BASE_URL}/inventory/owner/${ownerId}/summary`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ startDate, endDate }),
      }
    );
    return await handleResponse(response);

  },

  getMySummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/inventory/my-summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    return await handleResponse(response);

  },
};

// Owner Payment Services
export const ownerPaymentService = {
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/owner-payments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);

  },

  getHistory: async (ownerId, startDate, endDate) => {
    const response = await fetch(
      `${API_BASE_URL}/owner-payments/owner/${ownerId}/history`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ startDate, endDate }),
      }
    );
    return await handleResponse(response);

  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/owner-payments/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    return await handleResponse(response);

  },

  getOwnerSummary: async (ownerId, startDate, endDate) => {
    const response = await fetch(
      `${API_BASE_URL}/owner-payments/owner/${ownerId}/summary`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ startDate, endDate }),
      }
    );
    return await handleResponse(response);

  },
};

// Daily Work Services
export const dailyWorkService = {
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create daily work record');
    return await handleResponse(response);

  },

  getList: async (filters) => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(filters),
    });
    return await handleResponse(response);

  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    return await handleResponse(response);

  },

  getEmployeeSummary: async (employeeId, startDate, endDate) => {
    const response = await fetch(
      `${API_BASE_URL}/employee-daily-working/employee/${employeeId}/summary`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ startDate, endDate }),
      }
    );
    return await handleResponse(response);
  },
};
