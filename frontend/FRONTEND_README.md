# 🎀 NOOL Frontend - Setup & Installation Guide

## 📋 Overview

This is the premium, high-end frontend for the **NOOL Enterprise Resource Planning System**. It features:

- ✨ **Elegant, white-dominant design** with luxurious feel
- 🎬 **Smooth animations** that make the UI feel alive
- 🧩 **Reusable components** built with React & Tailwind CSS
- 🔐 **Secure JWT-based authentication** with role-based access control
- 📱 **Fully responsive** design (mobile, tablet, desktop)
- ⚡ **Fast & lightweight** using Vite as build tool
- 🎯 **Complete routing system** for all user roles (Admin, Employee, Owner)

## 🚀 Getting Started

### Prerequisites

Before starting, make sure you have:

- **Node.js** 16.0 or higher
- **npm** or **yarn** package manager
- **Backend running** on `http://localhost:8082`

### Installation Steps

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Common.jsx       # Button, Card, Input, Badge, etc.
│   │   ├── Layout.jsx       # Sidebar, Header, MainLayout
│   │   └── ProtectedRoutes.jsx
│   │
│   ├── pages/               # Page components
│   │   ├── LoginPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── EmployeesPage.jsx
│   │   ├── AttendancePage.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   └── PlaceholderPages.jsx
│   │
│   ├── context/             # React Context
│   │   └── AuthContext.jsx  # Authentication state management
│   │
│   ├── services/            # API service calls
│   │   └── api.js           # All backend API endpoints
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.js       # Authentication hook
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatters.js    # Date, currency formatting
│   │   └── validators.js    # Input validation
│   │
│   ├── styles/              # Global styles
│   │   └── globals.css      # Animations & global styles
│   │
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global Tailwind & styles
│
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── index.html               # HTML entry point
```

## 🔑 Key Features

### 1. Authentication Flow

```
User opens website
    ↓
Check for JWT token
    ↓
Token found? → Route to role-based dashboard
    ↓
No token? → Show Login Page
    ↓
User logs in with mobile number & password
    ↓
Backend validates credentials
    ↓
JWT token issued & stored
    ↓
User routed to dashboard
```

### 2. Role-Based Access Control

- **ADMIN**: Full system access - manage employees, owners, view analytics
- **EMPLOYEE**: Personal dashboard, attendance, salary, daily work
- **OWNER**: Manage inventory, transactions, payments

### 3. API Integration

All API calls are centralized in `services/api.js`:

```javascript
// Example: Login
const response = await authService.login(mobileNumber, password);

// Example: Fetch Employees
const employees = await employeeService.getList(pageNo, pageSize);

// Example: Mark Attendance
await attendanceService.mark({ employeeId, date, status });
```

### 4. Global State Management

Authentication state managed via React Context:

```javascript
// In any component
const { user, token, isAuthenticated, login, logout } = useAuth();
```

## 🎨 Design System

### Colors

- **Primary**: Indigo (#4F46E5)
- **Secondary**: Purple (#9333EA)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)
- **Background**: White (#FFFFFF)
- **Text**: Charcoal (#1F2937)

### Typography

- **Font**: Inter (from Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Animations

All animations are smooth and controlled:

- **Fade In**: Elements fade smoothly
- **Slide Up**: Elements slide in from bottom
- **Slide Down**: Elements slide in from top
- **Pulse**: Gentle pulsing motion
- **Hover Effects**: Lift, shadow, color changes

## 🔧 Available Components

### Common Components (from `components/Common.jsx`)

```jsx
<Button variant="primary" size="md">Click Me</Button>
<Card hover>Card content</Card>
<Input label="Name" required />
<Select label="Role" options={[...]} />
<Badge variant="success">Success</Badge>
<Modal isOpen={open} onClose={handleClose} title="Modal Title">
  Content
</Modal>
<Loading text="Loading..." />
<ErrorMessage message="Error occurred" onRetry={handleRetry} />
```

### Layout Components (from `components/Layout.jsx`)

```jsx
<MainLayout>
  Your page content
</MainLayout>

<Sidebar isOpen={open} setIsOpen={setIsOpen} />
<Header onMenuToggle={handleToggle} />
```

## 📝 Creating New Pages

1. **Create page component** in `src/pages/NewPage.jsx`:

```jsx
import React from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button } from '../components/Common';

export const NewPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Page Title</h1>
        {/* Your content */}
      </div>
    </MainLayout>
  );
};
```

2. **Add route** in `App.jsx`:

```jsx
<Route path="/admin/new-page" element={
  <PrivateRoute requiredRole="ADMIN">
    <NewPage />
  </PrivateRoute>
} />
```

## 🔌 Backend API Configuration

Backend is running on **`http://localhost:8082/api`**

All API calls automatically include JWT token from localStorage:

```javascript
Authorization: Bearer <JWT_TOKEN>
```

**Demo Credentials:**
- Mobile: `9876543210`
- Password: `Admin@123`

## 📊 Dashboard Features

### Admin Dashboard
- Total employees, owners, revenue statistics
- Employee status distribution
- Quick action buttons
- System status overview

### Employee Dashboard
- Personal profile information
- Today's attendance status
- Quick action cards
- Important information section

### Owner Dashboard
- Inventory management
- Transaction tracking
- Payment information

## 🚨 Error Handling

All API errors are caught and displayed:

```jsx
<ErrorMessage message={error} onRetry={handleRetry} />
```

## 🔒 Security

- JWT tokens stored in localStorage
- Automatic token inclusion in all requests
- Role-based route protection
- Secure logout (token removal)

## 🧪 Testing

Run development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running on `http://localhost:8082`
- Check CORS configuration in backend

### "Login fails"
- Verify credentials in backend `application.properties`
- Check network tab in browser DevTools
- Ensure backend database is running

### "Styling not applied"
- Run `npm install` to ensure Tailwind CSS is installed
- Rebuild Vite with `npm run dev`

## 📚 Dependencies

- **react**: ^19.2.5 - UI library
- **react-dom**: ^19.2.5 - React DOM renderer
- **react-router-dom**: ^6.21.0 - Client-side routing
- **tailwindcss**: ^3.4.17 - Utility-first CSS framework
- **vite**: ^8.0.10 - Build tool

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Open browser: `http://localhost:5173`
4. ✅ Login with demo credentials
5. ✅ Explore the dashboard

## 📝 Notes

- All timestamps are formatted in Indian Standard Time (IST)
- Currency is displayed in Indian Rupees (₹)
- Responsive design works on all screen sizes
- Smooth animations enhance user experience without sacrificing performance

## 👨‍💻 Developer

Built with ❤️ by **Gowtham Selvaraj**
- Full Stack Java Developer
- Programmer Analyst at Cognizant
- 1+ Years Experience | 9+ Projects | 50+ Students Trained

## 📄 License

This project is part of the NOOL Enterprise Resource Planning System.

---

**Happy Coding! 🚀**
