# 🚀 Quick Start Guide - New Features

## Daily Work Management

### Access
- **URL**: `/admin/daily-work`
- **Role Required**: ADMIN

### Features
- ✅ Track daily work activities
- ✅ Support 4 categories: Polishing, Stitching, QC, Packaging
- ✅ Date-based filtering
- ✅ CRUD operations

### How to Use
1. Click **"Add Work Record"** button
2. Select employee and work date
3. Enter task name and description
4. Select category and hours spent
5. Set status (Pending/In Progress/Completed)
6. Click **"Add Record"**

### Statistics Displayed
- Total Tasks
- Completed Tasks
- In Progress Tasks
- Total Hours Worked

---

## Inventory Management

### Access
- **URL**: `/admin/inventory`
- **Role Required**: ADMIN

### Features
- ✅ Manage stock levels
- ✅ Track inventory value
- ✅ Auto-detect low stock
- ✅ 5 categories support

### How to Use
1. Click **"Add Item"** button
2. Fill in item details (name, SKU, category)
3. Set quantity and minimum stock level
4. Enter unit price
5. Add supplier name
6. Click **"Add Item"**

### Stock Status Colors
- 🟢 **Green (OK)**: Stock above minimum
- 🟡 **Yellow (WARNING)**: Stock at minimum level
- 🔴 **Red (LOW)**: Stock below minimum

### Low Stock Alert
- Automatic alert when items fall below minimum
- Shows count of low stock items
- Quick action button to review

---

## Export Functionality

### Import the Export Utilities
```javascript
import { 
  exportToCSV, 
  exportToExcel, 
  exportToPDF, 
  printData 
} from '../utils/exporters';
```

### Export to CSV
```javascript
const handleExportCSV = () => {
  exportToCSV(employeeData, 'employees-list');
};
```

### Export to Excel
```javascript
const handleExportExcel = () => {
  exportToExcel(attendanceData, 'attendance-report');
};
```

### Export to PDF
```javascript
const handleExportPDF = async () => {
  // First install: npm install jspdf jspdf-autotable
  await exportToPDF(salaryData, 'salary-report', 'Monthly Salary Report');
};
```

### Print Data
```javascript
const handlePrint = () => {
  printData(employeeData, 'Employee List');
};
```

### Copy to Clipboard
```javascript
import { copyToClipboard } from '../utils/exporters';

const handleCopy = () => {
  copyToClipboard(tableData);
};
```

---

## Form Validation Patterns

### Basic Setup
```javascript
import { useFormValidation } from '../hooks/useFormValidation';

const MyForm = () => {
  const { formData, errors, handleChange, validateForm } = useFormValidation({
    name: '',
    email: '',
    phone: '',
  });

  const rules = {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true, pattern: /^[0-9]{10}$/ },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm(formData, rules);
    if (Object.keys(formErrors).length === 0) {
      // Submit form
    }
  };
};
```

### Field-Level Validation
```javascript
const [errors, setErrors] = useState({});

const validateField = (name, value) => {
  if (!value?.trim()) {
    setErrors(prev => ({
      ...prev,
      [name]: `${name} is required`
    }));
  } else {
    setErrors(prev => ({
      ...prev,
      [name]: null
    }));
  }
};
```

### Real-Time Validation
```javascript
const handleFieldChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // Validate field immediately
  validateField(name, value);
};
```

---

## API Integration

### Setup Environment
Create `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
```

### Create Service File
```javascript
// src/services/employeeService.js
import api from './api';

export const employeeService = {
  getList: async (page = 1, size = 10) => {
    const { data } = await api.get('/employees', {
      params: { page, size }
    });
    return data.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/employees/${id}`);
    return data.data;
  },

  create: async (employeeData) => {
    const { data } = await api.post('/employees', employeeData);
    return data.data;
  },

  update: async (id, employeeData) => {
    const { data } = await api.put(`/employees/${id}`, employeeData);
    return data.data;
  },

  delete: async (id) => {
    await api.delete(`/employees/${id}`);
  },
};
```

### Replace Simulated Data
```javascript
// BEFORE: Using mock data
const fetchEmployees = () => {
  const mockData = [{ id: '1', name: 'John' }];
  setEmployees(mockData);
};

// AFTER: Using API
const fetchEmployees = async () => {
  try {
    setLoading(true);
    const data = await employeeService.getList(currentPage, itemsPerPage);
    setEmployees(data.content || data);
    setLoading(false);
  } catch (error) {
    console.error('Error:', error);
    setLoading(false);
  }
};
```

### Error Handling
```javascript
try {
  const result = await employeeService.create(formData);
  showSuccess('Employee created successfully');
} catch (error) {
  if (error.response?.data?.errors) {
    setFormErrors(error.response.data.errors);
  } else {
    showError(error.message || 'An error occurred');
  }
}
```

---

## Page Routing Reference

### Admin Routes
```
/admin/dashboard       - Admin Dashboard
/admin/employees       - Employee Management
/admin/attendance      - Attendance Tracking
/admin/salary          - Salary Management
/admin/owners          - Saree Owner Management
/admin/daily-work      - Daily Work Management (NEW)
/admin/inventory       - Inventory Management (NEW)
/admin/payments        - Payment Management
/admin/analytics       - Analytics & Reports
```

### Employee Routes
```
/employee/dashboard    - Employee Dashboard
/employee/attendance   - View/Mark Attendance
/employee/salary       - View Salary Info
/employee/daily-work   - View Work Records
```

### Owner Routes
```
/owner/dashboard       - Owner Dashboard
/owner/profile         - Owner Profile
/owner/payments        - Payment History
/owner/transactions    - Transaction Details
```

---

## Component Usage Examples

### Using Table Component
```javascript
import { Table } from '../components/Common';

const columns = [
  {
    header: 'Name',
    render: (item) => <span className="font-medium">{item.name}</span>,
  },
  {
    header: 'Email',
    render: (item) => item.email,
  },
  {
    header: 'Actions',
    render: (item) => (
      <button onClick={() => handleEdit(item)}>Edit</button>
    ),
  },
];

<Table columns={columns} data={employees} />
```

### Using Modal Component
```javascript
import { Modal } from '../components/Common';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Add Employee"
  size="lg"
>
  {/* Form content */}
</Modal>
```

### Using Badge Component
```javascript
import { Badge } from '../components/Common';

<Badge className="bg-green-100 text-green-800">Active</Badge>
<Badge className="bg-red-100 text-red-800">Inactive</Badge>
```

### Using StatCard Component
```javascript
import { Card } from '../components/Common';
import { Users } from 'lucide-react';

<Card className="border-l-4 border-blue-500">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-600">Total Employees</p>
      <p className="text-3xl font-bold">150</p>
    </div>
    <Users className="w-6 h-6 text-blue-600" />
  </div>
</Card>
```

---

## Common Tasks

### Add New Page
1. Create file in `src/pages/PageName.jsx`
2. Use MainLayout wrapper
3. Add route in `App.jsx`
4. Protect with PrivateRoute if needed

### Add New Component
1. Create file in `src/components/ComponentName.jsx`
2. Import in `src/components/Common.jsx`
3. Export from Common.jsx
4. Use across pages

### Add New Service
1. Create file in `src/services/serviceName.js`
2. Import `api` from './api'
3. Define CRUD functions
4. Export service object

### Add Export Feature
1. Import exporters: `import { exportToCSV } from '../utils/exporters'`
2. Call in event handler
3. Pass data array and filename

---

## Debugging Tips

### Check Console Errors
```javascript
// Open DevTools → Console
// Look for red error messages
// Check network tab for API calls
```

### Test API Endpoints
```javascript
// In browser console
import { employeeService } from './services/employeeService';
const employees = await employeeService.getList();
console.log(employees);
```

### Debug State
```javascript
// Add console.log to understand state changes
useEffect(() => {
  console.log('Employees updated:', employees);
}, [employees]);
```

### Test Validation
```javascript
// Test validation functions directly
import { validateEmail } from '../utils/validators';
console.log(validateEmail('test@example.com')); // true/false
```

---

## Keyboard Shortcuts

- `Ctrl+K` - Quick search in VSCode
- `Alt+Shift+F` - Format code
- `F12` - Open DevTools
- `Ctrl+Shift+I` - Open DevTools Inspector

---

## Tips & Tricks

1. **Use loading states**: Show spinners during API calls
2. **Add error boundaries**: Catch rendering errors
3. **Use lazy loading**: Import pages with React.lazy()
4. **Optimize images**: Use webp format when possible
5. **Cache API responses**: Use React Query or similar
6. **Test on mobile**: Use browser DevTools mobile view
7. **Use Git commits**: Small, descriptive commits
8. **Document code**: Add comments for complex logic

---

## Need Help?

### Documentation Files
- 📖 `API_INTEGRATION_GUIDE.md` - Backend integration
- 📋 `FORM_VALIDATION_GUIDE.md` - Form validation
- 📊 `IMPLEMENTATION_COMPLETE.md` - Feature overview
- ✅ `TASK_COMPLETION_SUMMARY.md` - Task summary

### Quick Troubleshooting
1. Check browser console for errors
2. Verify API endpoint URLs
3. Check authentication token
4. Test with Postman
5. Review network requests in DevTools

### Performance
- Component count: 10+ reusable components
- Page load time: < 2s
- API response time: Check backend logs
- Image optimization: Use lazy loading

---

**Last Updated**: May 10, 2026  
**Version**: 1.0.0  
**Frontend Status**: Ready for API Integration & Testing
