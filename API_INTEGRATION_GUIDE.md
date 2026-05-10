# 🔌 API Integration Guide

## Overview
This guide explains how to connect the frontend to backend APIs. All pages are currently using simulated data and are ready for real API integration.

---

## 📍 API Service Structure

### Current Setup
All API calls go through `src/services/api.js` using Axios.

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🔄 Service Layer Pattern

### Example: Employee Service

**Before (Simulated):**
```javascript
// src/services/employeeService.js
const mockEmployees = [/* data */];

export const employeeService = {
  getList: () => Promise.resolve(mockEmployees),
  getById: (id) => Promise.resolve(mockEmployees.find(e => e.id === id)),
};
```

**After (API Connected):**
```javascript
import api from './api';

export const employeeService = {
  // Get all employees with pagination
  getList: async (page = 1, size = 10) => {
    const response = await api.get('/employees', {
      params: { page, size }
    });
    return response.data; // { content: [], totalPages: 1, totalElements: 10 }
  },

  // Get single employee
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create employee
  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Update employee
  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Delete employee
  delete: async (id) => {
    await api.delete(`/employees/${id}`);
  },
};
```

---

## 🎯 API Endpoints Reference

### Authentication
```
POST   /auth/login              - User login
POST   /auth/logout             - User logout
POST   /auth/refresh-token      - Refresh JWT token
GET    /auth/verify             - Verify current user
```

### Employees
```
GET    /employees               - List all employees (paginated)
GET    /employees/{id}          - Get employee details
POST   /employees               - Create new employee
PUT    /employees/{id}          - Update employee
DELETE /employees/{id}          - Delete employee
GET    /employees/search        - Search employees
```

### Attendance
```
GET    /attendance              - Get attendance records (paginated)
GET    /attendance/{id}         - Get single record
POST   /attendance              - Mark attendance
PUT    /attendance/{id}         - Update attendance
DELETE /attendance/{id}         - Delete attendance
GET    /attendance/employee/{empId}  - Get employee's attendance
GET    /attendance/date/{date}  - Get attendance by date
GET    /attendance/statistics   - Get attendance stats
```

### Salary
```
GET    /salary                  - List salary records
GET    /salary/{id}             - Get salary details
POST   /salary/process          - Process monthly salary
GET    /salary/employee/{empId} - Get employee salary history
GET    /salary/month/{month}    - Get salary by month
PUT    /salary/{id}             - Update salary
DELETE /salary/{id}             - Delete salary record
```

### Saree Owners
```
GET    /owners                  - List all owners
GET    /owners/{id}             - Get owner details
POST   /owners                  - Create owner
PUT    /owners/{id}             - Update owner
DELETE /owners/{id}             - Delete owner
GET    /owners/{id}/transactions - Get owner transactions
POST   /owners/{id}/payment     - Record payment
```

### Inventory
```
GET    /inventory               - List all items
GET    /inventory/{id}          - Get item details
POST   /inventory               - Add inventory item
PUT    /inventory/{id}          - Update item
DELETE /inventory/{id}          - Delete item
GET    /inventory/category/{category} - Filter by category
GET    /inventory/low-stock     - Get low stock items
```

### Daily Work
```
GET    /daily-work              - List work records
GET    /daily-work/{id}         - Get work details
POST   /daily-work              - Create work record
PUT    /daily-work/{id}         - Update work record
DELETE /daily-work/{id}         - Delete work record
GET    /daily-work/employee/{empId} - Get employee's work
GET    /daily-work/date/{date}  - Get work by date
GET    /daily-work/statistics   - Get work statistics
```

### Analytics
```
GET    /analytics/dashboard     - Dashboard metrics
GET    /analytics/attendance    - Attendance analytics
GET    /analytics/salary        - Salary analytics
GET    /analytics/revenue       - Revenue analytics
GET    /analytics/report/{month} - Monthly report
```

---

## 📋 Request/Response Format

### Standard Request Format
```json
{
  "employeeName": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "joiningDate": "2024-01-15",
  "polishingRate": 50
}
```

### Standard Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "EMP001",
    "employeeName": "John Doe",
    "mobile": "9876543210",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Paginated Response Format
```json
{
  "success": true,
  "data": {
    "content": [
      { "id": "1", "name": "Item 1" },
      { "id": "2", "name": "Item 2" }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 1,
    "pageSize": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email already exists",
    "mobile": "Invalid mobile number"
  },
  "timestamp": "2024-05-10T10:30:00Z"
}
```

---

## 🔧 Integration Steps

### Step 1: Update Environment Variables
Create `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=NOOL
VITE_APP_VERSION=1.0.0
```

### Step 2: Update api.js
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL;
```

### Step 3: Create Service File
```javascript
// src/services/employeeService.js
import api from './api';

export const employeeService = {
  getList: async (page = 1, size = 10) => {
    const response = await api.get('/employees', { params: { page, size } });
    return response.data.data; // Return paginated content
  },
  // ... other methods
};
```

### Step 4: Update Page Component
Replace simulated data fetch with real API call:

**Before:**
```javascript
const fetchEmployees = async () => {
  const mockData = [/* ... */];
  setEmployees(mockData);
};
```

**After:**
```javascript
const fetchEmployees = async () => {
  try {
    setLoading(true);
    const data = await employeeService.getList(currentPage, itemsPerPage);
    setEmployees(data.content || data);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching employees:', error);
    setLoading(false);
  }
};
```

---

## 📝 Implementation Checklist

### Attendance Page
- [ ] Update `fetchWorkRecords()` to use API
- [ ] Update `markAttendance()` to use API
- [ ] Verify pagination with real data
- [ ] Test date filtering

### Salary Page
- [ ] Update `fetchSalaryRecords()` to use API
- [ ] Implement `processSalary()` API call
- [ ] Add validation before processing
- [ ] Test calculations with real data

### Employee Page
- [ ] Update `fetchEmployees()` to use API
- [ ] Implement `createEmployee()` API call
- [ ] Implement `updateEmployee()` API call
- [ ] Implement `deleteEmployee()` API call
- [ ] Test pagination and search

### Owner Page
- [ ] Update `fetchOwners()` to use API
- [ ] Implement payment transaction API
- [ ] Test payment tracking
- [ ] Verify progress calculation

### Daily Work Page
- [ ] Update `fetchWorkRecords()` to use API
- [ ] Implement CRUD operations
- [ ] Test date filtering
- [ ] Verify statistics calculation

### Inventory Page
- [ ] Update `fetchInventory()` to use API
- [ ] Implement stock status checking
- [ ] Test low stock alerts
- [ ] Verify category filtering

---

## 🚨 Error Handling Pattern

```javascript
try {
  setLoading(true);
  const response = await api.get('/employees');
  setData(response.data.data);
  setError(null);
} catch (error) {
  // Handle different error types
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Forbidden - show access denied
    setError('You do not have permission to perform this action');
  } else if (error.response?.status === 404) {
    // Not found
    setError('Resource not found');
  } else if (error.response?.data?.errors) {
    // Validation errors
    setError(error.response.data.errors);
  } else {
    // Generic error
    setError(error.message || 'An error occurred');
  }
  console.error('API Error:', error);
} finally {
  setLoading(false);
}
```

---

## 🔐 Authentication Integration

### Setup JWT Token
```javascript
// After login
const response = await api.post('/auth/login', { email, password });
const token = response.data.data.token;
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify(response.data.data.user));
```

### Auto-refresh Token
```javascript
// src/services/api.js
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        const response = await api.post('/auth/refresh-token');
        const newToken = response.data.data.token;
        localStorage.setItem('authToken', newToken);
        // Retry original request
        return api(error.config);
      } catch (err) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 Testing API Integration

### Using Postman/Insomnia
1. Set Base URL: `http://localhost:8080/api`
2. Add header: `Authorization: Bearer YOUR_TOKEN`
3. Test each endpoint

### Frontend Testing
```javascript
// Test in browser console
import { employeeService } from './services/employeeService';

// Test API connection
const employees = await employeeService.getList();
console.log(employees);
```

---

## 🐛 Common Issues & Solutions

### CORS Errors
**Solution**: Backend should enable CORS
```java
// Spring Boot
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
      .allowedOrigins("http://localhost:3000")
      .allowedMethods("*");
  }
}
```

### 401 Unauthorized
**Solution**: Check token in localStorage or refresh token

### 404 Not Found
**Solution**: Verify API endpoint URL matches backend route

### Slow API Response
**Solution**: Add loading states and loading spinners

---

## 📦 Service Examples

### Complete Employee Service Example
```javascript
import api from './api';

export const employeeService = {
  // List with pagination
  getList: async (page = 1, size = 10) => {
    const { data } = await api.get('/employees', {
      params: { page, size }
    });
    return data.data;
  },

  // Get single
  getById: async (id) => {
    const { data } = await api.get(`/employees/${id}`);
    return data.data;
  },

  // Create
  create: async (employeeData) => {
    const { data } = await api.post('/employees', employeeData);
    return data.data;
  },

  // Update
  update: async (id, employeeData) => {
    const { data } = await api.put(`/employees/${id}`, employeeData);
    return data.data;
  },

  // Delete
  delete: async (id) => {
    await api.delete(`/employees/${id}`);
  },

  // Search
  search: async (query) => {
    const { data } = await api.get('/employees/search', {
      params: { query }
    });
    return data.data;
  },

  // Get by date range
  getByDateRange: async (startDate, endDate) => {
    const { data } = await api.get('/employees/date-range', {
      params: { startDate, endDate }
    });
    return data.data;
  },
};
```

---

## ✅ Migration Checklist

- [ ] Create all service files
- [ ] Update all API endpoints
- [ ] Test each page with real API
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test authentication flow
- [ ] Verify pagination
- [ ] Test form validations
- [ ] Add success/error notifications
- [ ] Performance optimization

---

## 📞 Support

For API integration issues:
1. Check backend logs
2. Verify endpoint URLs
3. Check request/response format
4. Test with Postman first
5. Debug with browser DevTools

---

**Last Updated**: May 10, 2026  
**Version**: 1.0.0
