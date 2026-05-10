# 🎀 NOOL Frontend Development Plan
## Professional ERP Dashboard with Light Colors

---

## 📊 Backend Architecture Summary

### **Role-Based Architecture:**
1. **ADMIN** - Full system access
   - Create/manage employees and owners
   - View all dashboards and analytics
   - Manage all transactions
   
2. **WORKER** - Employee specific access
   - View own profile and attendance
   - View own salary payments
   - View daily work records
   
3. **SAREE_OWNER** - Owner specific access
   - View own inventory
   - Track transactions
   - View payments

### **Key Entities:**
- **User & UserProfile** - Authentication (JWT-based)
- **Employee** - Worker management with polishing rates
- **Attendance** - Daily attendance tracking
- **SalaryPayment** - Employee salary processing
- **SareeOwner** - Owner profile management
- **SareeTransaction** - Inventory & transaction tracking
- **OwnerPayment** - Payment processing for owners
- **EmployeeDailyWork** - Work tracking

### **Authentication Flow:**
- Login endpoint: `POST /api/auth/login`
- JWT Token-based authentication
- Role-based access control
- Bootstrap admin creation on startup

---

## 🎨 Design System

### **Color Palette (Light & Professional):**
- **Primary White**: `#FFFFFF` (Main background)
- **Light Gray**: `#F8F9FA` (Card backgrounds, hover states)
- **Gray Accent**: `#E9ECEF` (Borders, dividers)
- **Dark Gray**: `#6C757D` (Secondary text)
- **Charcoal**: `#212529` (Primary text)
- **Accent Colors**:
  - Blue: `#0D6EFD` (Primary actions, links)
  - Green: `#198754` (Success, positive metrics)
  - Red: `#DC3545` (Warning, negative metrics)
  - Amber: `#FFC107` (Pending, neutral metrics)

### **Typography:**
- **Font Family**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Small text**: 300-400 weight

### **Spacing & Layout:**
- Base unit: 4px
- Padding: 16px, 24px, 32px
- Border Radius: 8px, 12px
- Shadow: Subtle elevation shadows

---

## 📱 Page Structure

### **1. Landing Page**
- Navigation bar with Login button
- Hero section with product overview
- Features showcase
- Call-to-action

### **2. Login Page**
- Clean form with email/password
- Remember me option
- Beautiful background with white form card
- Error handling

### **3. Admin Dashboard**
- Welcome header with date
- Quick stats cards (New tickets, Projects, Leave balance, etc.)
- Charts and analytics
- Recent activity
- Role-specific widgets

### **4. Employee Dashboard**
- Personal stats (Attendance, Salary, Daily Work)
- Recent attendance records
- Payment history preview
- Quick actions

### **5. Owner Dashboard**
- Inventory summary
- Transaction history
- Payment tracking
- Recent activity

### **6. Management Pages**
- **Employees Management** - List, Create, Edit, Delete
- **Owners Management** - List, Create, Edit, Delete
- **Attendance Management** - View, Mark, Analytics
- **Salary Management** - Process, History, Reports
- **Inventory Management** - Stock, Transactions, Analytics
- **Payments Management** - Process, History, Reports

### **7. Analytics Page**
- Revenue charts
- Workforce metrics
- Attendance analytics
- Payment summaries

---

## 🛠️ Technology Stack

- **React 19** - UI framework
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js / Recharts** - Analytics visualization
- **Axios** - HTTP client
- **Context API** - State management
- **Lucide React** - Icons

---

## 📦 Component Architecture

### **Layout Components:**
- `Layout.jsx` - Main wrapper with sidebar
- `Navbar.jsx` - Top navigation
- `Sidebar.jsx` - Left navigation menu
- `Footer.jsx` - Footer section

### **Common Components:**
- `Card.jsx` - Reusable card wrapper
- `Button.jsx` - Primary, secondary, danger variants
- `Badge.jsx` - Status indicators
- `Modal.jsx` - Dialog/modal wrapper
- `Table.jsx` - Data tables with pagination
- `Form.jsx` - Form wrapper with validation
- `Input.jsx` - Form input field
- `Select.jsx` - Dropdown selector
- `DatePicker.jsx` - Date selection
- `Loading.jsx` - Loading spinner
- `Error.jsx` - Error message display

### **Dashboard Components:**
- `StatCard.jsx` - Metric card with icon and value
- `ChartCard.jsx` - Chart wrapper
- `RecentActivity.jsx` - Activity feed
- `QuickAction.jsx` - Action button

### **Form Components:**
- `CreateEmployeeForm.jsx` - Employee creation
- `CreateOwnerForm.jsx` - Owner creation
- `AttendanceForm.jsx` - Mark attendance
- `SalaryForm.jsx` - Process salary
- `TransactionForm.jsx` - Record transaction

---

## 🔌 API Integration

### **Endpoints to Integrate:**

**Authentication:**
- `POST /api/auth/login` - Login

**Admin Dashboard:**
- `GET /api/admin/dashboard/summary` - Dashboard summary
- `POST /api/admin/dashboard/revenue` - Revenue analytics
- `POST /api/admin/dashboard/revenue/month` - Monthly revenue
- `POST /api/admin/dashboard/workforce` - Workforce metrics

**Employees:**
- `POST /api/employees` - Create employee
- `PUT /api/employees` - Update employee
- `PATCH /api/employees/status` - Update status
- `GET /api/employees/{employeeId}` - Get employee
- `POST /api/employees/list` - List employees with pagination
- `GET /api/employees/me` - Get current user profile

**Attendance:**
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/{attendanceId}` - Get attendance
- `POST /api/attendance/list` - List attendance
- `POST /api/attendance/employee/{employeeId}/summary` - Attendance summary
- `POST /api/attendance/summary` - Overall summary

**Salary:**
- `POST /api/salary/pay` - Process salary payment
- `POST /api/salary/employee/{employeeId}/history` - Salary history
- `POST /api/salary/summary` - Salary summary

**Saree Owners:**
- `POST /api/saree-owners` - Create owner
- `GET /api/saree-owners/{ownerId}` - Get owner
- `POST /api/saree-owners/list` - List owners
- `GET /api/saree-owners/me` - Get current owner

**Saree Transactions:**
- `POST /api/saree-inventory/transaction` - Record transaction
- `POST /api/saree-inventory/transactions` - List transactions
- `POST /api/saree-inventory/summary` - Inventory summary

**Owner Payments:**
- `POST /api/owner-payments` - Process payment
- `POST /api/owner-payments/history` - Payment history
- `POST /api/owner-payments/summary` - Payment summary

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1)**
- [ ] Setup project structure
- [ ] Create base layout components
- [ ] Design system implementation
- [ ] Auth context integration
- [ ] API service setup

### **Phase 2: Auth & Landing (Week 1-2)**
- [ ] Landing page
- [ ] Login page
- [ ] Error handling

### **Phase 3: Dashboards (Week 2-3)**
- [ ] Admin dashboard with stats and charts
- [ ] Employee dashboard
- [ ] Owner dashboard

### **Phase 4: Management Pages (Week 3-4)**
- [ ] Employees management
- [ ] Owners management
- [ ] Attendance management
- [ ] Tables and list views

### **Phase 5: Financial (Week 4-5)**
- [ ] Salary management
- [ ] Payment management
- [ ] Owner payments

### **Phase 6: Inventory & Analytics (Week 5-6)**
- [ ] Inventory management
- [ ] Transaction tracking
- [ ] Analytics page

### **Phase 7: Polish & Optimization (Week 6)**
- [ ] Performance optimization
- [ ] Testing
- [ ] Bug fixes
- [ ] UI/UX refinements

---

## ✅ Acceptance Criteria

1. ✅ Professional light-colored design matching reference images
2. ✅ All role-based dashboards functional
3. ✅ Complete CRUD operations for all entities
4. ✅ Responsive design (desktop, tablet, mobile)
5. ✅ Error handling and validation
6. ✅ Loading states and transitions
7. ✅ Smooth animations
8. ✅ Accessibility compliance

---

## 📝 Notes

- Maintain consistency with reference UI designs
- Use Tailwind CSS for all styling
- Keep components reusable and modular
- Implement proper error boundaries
- Add loading skeletons for better UX
- Use proper TypeScript-like JSDoc comments
- Implement caching where applicable

