# Quick Testing Guide - Employee/Owner Creation & Login Flow

## Before You Start
- Backend compiled successfully: `mvnw compile -DskipTests`
- Frontend built successfully: `npm run build`
- Both services ready to run

---

## Quick Test: Employee Creation → Login

### Step 1: Start Backend
```powershell
cd c:\Users\2460502\OneDrive\ -\ Cognizant\Desktop\NOOL\backend
# Run Spring Boot application
# Default: http://localhost:8080
```

### Step 2: Start Frontend
```powershell
cd c:\Users\2460502\OneDrive\ -\ Cognizant\Desktop\NOOL\frontend
npm run dev
# Runs on: http://localhost:5174
```

### Step 3: Login as Admin
```
URL: http://localhost:5174/login
Mobile: 9876543210    (Admin credentials from backend)
Password: admin@123
```

### Step 4: Create New Employee
1. Navigate to: Admin → Employees
2. Click: "Add Employee" button
3. Fill form:
   ```
   Employee Name: Test Employee
   Mobile Number: 9876543211
   Joining Date: 2024-01-15
   Polishing Rate: 25
   Password: test@12345
   ```
4. Click: "Create Employee"

**Expected Result:**
- ✅ Modal closes
- ✅ Success notification appears
- ✅ New employee appears in list
- ✅ **CRITICAL:** Backend creates BOTH Employee AND User account

### Step 5: Verify User Created in Backend
```bash
# Check backend logs for:
# "User created successfully with WORKER role"
# "UserProfile created for Employee ID: [id]"
```

### Step 6: Test Employee Login
1. **Logout** from admin account
   - Click profile → Logout
   
2. Go to: **Login Page**
   ```
   URL: http://localhost:5174/login
   Mobile: 9876543211
   Password: test@12345
   ```

3. Click: "Sign In"

**Expected Result:**
- ✅ Login succeeds
- ✅ Redirected to Employee Dashboard
- ✅ Dashboard shows employee profile
- ✅ Dashboard displays real data (or fallback mock data)
- ✅ **SUCCESS: Employee can now login!**

---

## Quick Test: Owner Creation → Login

### Step 1: Create New Owner
1. Go to: Admin → Owners page
2. Click: "Add Owner" button
3. Fill form:
   ```
   Owner Name: Test Owner
   Mobile Number: 9876543212
   Password: owner@12345
   ```
4. Click: "Create Owner"

**Expected Result:**
- ✅ Owner created successfully
- ✅ Backend creates BOTH SareeOwner AND User account

### Step 2: Test Owner Login
1. **Logout** from admin
2. Go to: **Login Page**
   ```
   Mobile: 9876543212
   Password: owner@12345
   ```
3. Click: "Sign In"

**Expected Result:**
- ✅ Login succeeds
- ✅ Redirected to Owner Dashboard
- ✅ Dashboard displays

---

## Dashboard Data Verification

### Employee Dashboard
Check that data is loaded:
1. Profile section shows:
   - ✅ Employee name
   - ✅ Mobile number
   - ✅ Joining date
   - ✅ Polishing rate

2. Statistics section shows:
   - ✅ Present days (from daily work records)
   - ✅ Attendance percentage
   - ✅ Fresh count (sarees polished fresh)
   - ✅ Re-polish count

3. If no data from API:
   - ✅ Fallback mock data displayed gracefully

### Owner Dashboard  
Check that data is loaded:
1. Owner info section shows:
   - ✅ Owner name
   - ✅ Mobile number
   - ✅ Total amount
   - ✅ Paid/Pending amounts

2. Transactions section shows:
   - ✅ Recent transactions listed
   - ✅ Payment status indicators

---

## Troubleshooting

### Issue: Login Fails After Creating Employee
**Symptom:** 
```
Error: Invalid credentials
Mobile: 9876543211 / Password: test@12345
```

**Fix:**
- Check backend logs for "User created successfully" message
- Verify password was entered correctly during creation
- Check if User entity was created in database

**Debug:**
```bash
# Backend logs should show:
# "Employee created: [name]"
# "User created successfully"
# If only "Employee created" appears → User creation failed
```

### Issue: Dashboard Shows Only Mock Data
**Symptom:**
- Employee Dashboard displays hardcoded names like "John Doe"

**Cause:**
- API calls failed (check network tab in browser DevTools)
- Backend not running on http://localhost:8080
- JWT token expired

**Fix:**
1. Verify backend is running
2. Check browser console for API errors
3. Re-login to refresh JWT token
4. Check API endpoints return data:
   - http://localhost:8080/api/employees/me (requires auth)
   - http://localhost:8080/api/employee-daily-working/summary (requires auth)

### Issue: Password Not Being Used During Creation
**Symptom:**
- Employee created but password ignored
- "Can't login with provided password"

**Cause:**
- Frontend not sending password in request
- Password field in DTO missing
- AdminUserService not called in createEmployee()

**Verification:**
1. Check browser Network tab:
   - POST /api/employees
   - Request body should include: `"password": "test@12345"`

2. Check backend logs:
   - Should see: "Creating user with mobile: 9876543211"
   - Should see: "User created successfully"

---

## Key Indicators of Success

### ✅ When Everything Works:
1. **Employee Creation:**
   - Backend creates Employee record ✓
   - Backend creates User record ✓
   - Backend creates UserProfile record ✓

2. **Login Flow:**
   - New Employee can login with mobile number ✓
   - New Employee sees their dashboard ✓
   - Dashboard loads real data from APIs ✓

3. **Data Consistency:**
   - Employee name matches in both Employee and UserProfile ✓
   - Mobile number consistent across entities ✓
   - Role correctly set to "WORKER" or "SAREE_OWNER" ✓

### ⚠️ Warning Signs (Things to Fix):
- Login fails with correct credentials → User account wasn't created
- Dashboard shows "John Doe" instead of actual employee name → API not being called
- No password prompt during Employee creation → Password field missing
- Backend errors during creation → AdminUserService not being called

---

## Database Check (Direct Verification)

If using MySQL/H2 in-memory database:

```sql
-- Check if Employee was created
SELECT * FROM employees WHERE mobile_number = '9876543211';

-- Check if User was created  
SELECT * FROM users WHERE mobile_number = '9876543211';

-- Check if UserProfile was created
SELECT * FROM user_profiles WHERE user_id = [user_id_from_above];

-- Verify relationship
SELECT e.*, u.mobile_number, up.id as profile_id
FROM employees e
JOIN user_profiles up ON e.id = up.employee_id
JOIN users u ON up.user_id = u.id
WHERE e.mobile_number = '9876543211';
```

**Expected:** All 3 records should exist and be properly linked

---

## Command Quick Reference

```powershell
# Build Backend
cd backend
./mvnw clean compile -DskipTests

# Start Backend (if Spring Boot main class)
# Usually: cd backend && mvn spring-boot:run

# Build Frontend
cd frontend
npm run build

# Start Frontend Dev Server
npm run dev  # http://localhost:5174

# Check if services are running
# Backend: curl http://localhost:8080/api/employees/me
# Frontend: Open http://localhost:5174 in browser
```

---

## Next: If Everything Works
1. ✅ Test creating multiple employees
2. ✅ Test creating multiple owners  
3. ✅ Each should be able to login
4. ✅ Each should see their own data
5. ✅ Test role-based access (admin vs employee vs owner)

## Next: If Something Breaks
1. Check backend logs for errors
2. Check browser console for JavaScript errors
3. Check Network tab for failed API requests
4. Verify database connections
5. Review changes in INTEGRATION_FIXES_SUMMARY.md
