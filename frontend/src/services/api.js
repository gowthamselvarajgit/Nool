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

// Auth Services
export const authService = {
  login: async (mobileNumber, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ mobileNumber, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    return await response.json();
  },

  logout: async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: headers(),
    });
  },

  validate: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: headers(),
    });
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to create employee');
    return await response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Employee not found');
    return await response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/employees/me`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  },

  update: async (data) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update employee');
  },

  getList: async (pageNo = 0, pageSize = 10, searchKeyword = '') => {
    const response = await fetch(`${API_BASE_URL}/employees/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ pageNo, pageSize, searchKeyword }),
    });
    if (!response.ok) throw new Error('Failed to fetch employees');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to mark attendance');
    return await response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Attendance not found');
    return await response.json();
  },

  getList: async (filters) => {
    const response = await fetch(`${API_BASE_URL}/attendance/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(filters),
    });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/attendance/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to fetch summary');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to fetch summary');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to create salary payment');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to fetch salary history');
    return await response.json();
  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/salary-payments/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to fetch salary summary');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to fetch employee salary summary');
    return await response.json();
  },
};

// Dashboard Services
export const dashboardService = {
  getSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard summary');
    return await response.json();
  },

  getRevenueAnalytics: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/revenue`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to fetch revenue analytics');
    return await response.json();
  },

  getMonthlyRevenue: async (month, year) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/revenue/month`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ month, year }),
    });
    if (!response.ok) throw new Error('Failed to fetch monthly revenue');
    return await response.json();
  },

  getWorkforceAnalytics: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/workforce`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to fetch workforce analytics');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to create owner');
    return await response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Owner not found');
    return await response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/owners/me`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  },

  update: async (data) => {
    const response = await fetch(`${API_BASE_URL}/owners`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update owner');
  },

  getList: async (pageNo = 0, pageSize = 10, searchKeyword = '') => {
    const response = await fetch(`${API_BASE_URL}/owners/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ pageNo, pageSize, searchKeyword }),
    });
    if (!response.ok) throw new Error('Failed to fetch owners');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to create transaction');
    return await response.json();
  },

  getTransactions: async (filters) => {
    const response = await fetch(`${API_BASE_URL}/inventory/transactions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(filters),
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/inventory/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to fetch inventory summary');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to fetch owner summary');
    return await response.json();
  },

  getMySummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/inventory/my-summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to fetch my summary');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to create owner payment');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to fetch payment history');
    return await response.json();
  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/owner-payments/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to fetch payment summary');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to fetch owner payment summary');
    return await response.json();
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
    return await response.json();
  },

  getList: async (filters) => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working/list`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(filters),
    });
    if (!response.ok) throw new Error('Failed to fetch daily work records');
    return await response.json();
  },

  getSummary: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/employee-daily-working/summary`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to fetch daily work summary');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to fetch employee daily work summary');
    return await response.json();
  },
};
