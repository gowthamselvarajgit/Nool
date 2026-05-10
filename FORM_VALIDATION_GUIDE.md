# 📋 Form Validation & Error Handling Guide

## Overview
This guide covers form validation patterns, error handling strategies, and best practices used across all pages.

---

## 🎯 Validation Patterns

### 1. Basic Field Validation

```javascript
// Simple validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};
```

### 2. Form-Level Validation

```javascript
// Complete form validation
const validateForm = (formData) => {
  const errors = {};

  // Required field checks
  if (!formData.employeeName?.trim()) {
    errors.employeeName = 'Employee name is required';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Phone must be 10 digits';
  }

  if (!formData.rate || formData.rate <= 0) {
    errors.rate = 'Valid rate is required';
  }

  return errors;
};

// Usage in form submit
const handleSubmit = (e) => {
  e.preventDefault();
  const errors = validateForm(formData);
  
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  // Form is valid, proceed with submission
  submitForm();
};
```

---

## ✅ Validation Rules by Field Type

### Text Fields
```javascript
{
  required: true,
  minLength: 2,
  maxLength: 100,
  pattern: /^[a-zA-Z\s]*$/, // Only letters
  message: 'Must be 2-100 characters and contain only letters',
}
```

### Email Fields
```javascript
{
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'Please enter a valid email address',
}
```

### Phone Fields
```javascript
{
  required: true,
  pattern: /^[0-9]{10}$/,
  message: 'Please enter a valid 10-digit phone number',
}
```

### Number Fields
```javascript
{
  required: true,
  min: 0,
  max: 999999,
  step: 0.01,
  message: 'Please enter a valid number',
}
```

### Date Fields
```javascript
{
  required: true,
  min: '1950-01-01',
  max: new Date().toISOString().split('T')[0],
  message: 'Please select a valid date',
}
```

### Select/Dropdown
```javascript
{
  required: true,
  message: 'Please select an option',
}
```

---

## 🛡️ Real-Time Validation

### As-You-Type Validation
```javascript
const handleFieldChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));

  // Validate field in real-time
  validateField(name, value);
};

const validateField = (name, value) => {
  const newErrors = { ...formErrors };

  switch (name) {
    case 'email':
      if (value && !validateEmail(value)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
      break;

    case 'phone':
      if (value && !validatePhone(value)) {
        newErrors.phone = 'Phone must be 10 digits';
      } else {
        delete newErrors.phone;
      }
      break;

    case 'rate':
      if (value <= 0) {
        newErrors.rate = 'Rate must be greater than 0';
      } else {
        delete newErrors.rate;
      }
      break;

    default:
      if (!value?.trim()) {
        newErrors[name] = `${name} is required`;
      } else {
        delete newErrors[name];
      }
  }

  setFormErrors(newErrors);
};
```

### Debounced Validation (Avoid Too Many Checks)
```javascript
import { useCallback } from 'react';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const debouncedValidate = useCallback(
  debounce((name, value) => {
    validateField(name, value);
  }, 500),
  []
);

const handleFieldChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));
  debouncedValidate(name, value);
};
```

---

## 🎨 Error Display Components

### Error Input Component
```jsx
const ErrorInput = ({ name, value, onChange, error, label, placeholder }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};
```

### Form Error Summary
```jsx
const ErrorSummary = ({ errors }) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
      <h3 className="font-semibold text-red-800 mb-2">
        Please fix the following errors:
      </h3>
      <ul className="space-y-1">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field} className="text-sm text-red-700">
            • {error}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### Field-Level Error Display
```jsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Employee Name
  </label>
  <input
    type="text"
    name="employeeName"
    value={formData.employeeName}
    onChange={handleFieldChange}
    className={`w-full px-3 py-2 border rounded-lg ${
      formErrors.employeeName ? 'border-red-500' : 'border-gray-300'
    }`}
  />
  {formErrors.employeeName && (
    <p className="text-sm text-red-600">{formErrors.employeeName}</p>
  )}
</div>
```

---

## 🔄 API Validation

### Server-Side Validation Errors
```javascript
try {
  const response = await api.post('/employees', formData);
  // Success
} catch (error) {
  if (error.response?.status === 400) {
    // Validation errors from server
    const serverErrors = error.response.data.errors;
    setFormErrors(serverErrors);
  } else if (error.response?.status === 409) {
    // Conflict (e.g., duplicate email)
    setFormErrors({
      email: 'This email is already registered',
    });
  } else {
    // Other errors
    setFormErrors({
      submit: error.message || 'An error occurred',
    });
  }
}
```

### Combined Validation Strategy
```javascript
const handleSaveEmployee = async () => {
  // Step 1: Client-side validation
  const clientErrors = validateForm(formData);
  if (Object.keys(clientErrors).length > 0) {
    setFormErrors(clientErrors);
    return;
  }

  // Step 2: API call with server validation
  try {
    setLoading(true);
    const response = await employeeService.create(formData);
    
    // Step 3: Success handling
    setShowModal(false);
    setFormData(initialFormState);
    setFormErrors({});
    
    // Refresh list
    fetchEmployees();
    
    // Show success message
    showSuccessNotification('Employee created successfully');
  } catch (error) {
    // Step 4: Handle server-side validation errors
    if (error.response?.data?.errors) {
      setFormErrors(error.response.data.errors);
    } else {
      setFormErrors({ submit: error.message });
    }
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 Complete Form Example

```jsx
import React, { useState } from 'react';
import { Card, Input, Button, Select, Modal } from '../components/Common';
import { AlertCircle, CheckCircle } from 'lucide-react';

const EmployeeForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(
    initialData || {
      employeeName: '',
      email: '',
      phone: '',
      rate: '',
      category: 'POLISHING',
    }
  );

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // Validation rules
  const rules = {
    employeeName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]*$/,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      required: true,
      pattern: /^[0-9]{10}$/,
    },
    rate: {
      required: true,
      min: 1,
      max: 999,
    },
  };

  // Single field validation
  const validateField = (name, value) => {
    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && !value?.toString().trim()) {
      return `${name} is required`;
    }

    if (rule.minLength && value?.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      return `Invalid ${name} format`;
    }

    if (rule.min && value < rule.min) {
      return `${name} must be at least ${rule.min}`;
    }

    if (rule.max && value > rule.max) {
      return `${name} cannot exceed ${rule.max}`;
    }

    return null;
  };

  // Form-level validation
  const validateForm = () => {
    const errors = {};
    Object.keys(rules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    return errors;
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Real-time validation
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setTouched(
        Object.keys(rules).reduce((acc, field) => ({
          ...acc,
          [field]: true,
        }), {})
      );
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      setFormData(initialData || {});
      setFormErrors({});
      setTouched({});
    } catch (error) {
      setFormErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Employee' : 'Add Employee'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Summary */}
        {formErrors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            {formErrors.submit}
          </div>
        )}

        {/* Employee Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Name *
          </label>
          <input
            type="text"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              touched.employeeName && formErrors.employeeName
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter employee name"
          />
          {touched.employeeName && formErrors.employeeName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {formErrors.employeeName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              touched.email && formErrors.email
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter email"
          />
          {touched.email && formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              touched.phone && formErrors.phone
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="10-digit phone number"
            maxLength="10"
          />
          {touched.phone && formErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
          )}
        </div>

        {/* Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Polishing Rate (₹/item) *
          </label>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              touched.rate && formErrors.rate
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="0"
            min="1"
          />
          {touched.rate && formErrors.rate && (
            <p className="mt-1 text-sm text-red-600">{formErrors.rate}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            className="flex-1 bg-blue-600"
          >
            {initialData ? 'Update' : 'Add'} Employee
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeForm;
```

---

## 🧪 Testing Validations

```javascript
// Test form validation
describe('EmployeeForm Validation', () => {
  test('should show error for empty name', () => {
    const error = validateField('employeeName', '');
    expect(error).toBe('employeeName is required');
  });

  test('should show error for invalid email', () => {
    const error = validateField('email', 'invalid-email');
    expect(error).toBe('Invalid email format');
  });

  test('should show error for short phone', () => {
    const error = validateField('phone', '123456');
    expect(error).toBe('Invalid phone format');
  });

  test('should pass validation for valid data', () => {
    const data = {
      employeeName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      rate: 50,
    };
    const errors = validateForm(data);
    expect(Object.keys(errors).length).toBe(0);
  });
});
```

---

## ✨ Best Practices

1. **Show Errors Only After Touch**: Don't validate before user interacts
2. **Real-Time Feedback**: Provide immediate feedback on field changes
3. **Clear Messages**: Use specific, actionable error messages
4. **Server Validation**: Always validate on the server too
5. **Visual Indicators**: Use colors/icons to highlight errors
6. **Progress Indication**: Show form completion progress
7. **Disable Submit**: Disable submit button while loading or if form invalid
8. **Focus Management**: Focus on first error field

---

**Last Updated**: May 10, 2026
