# Backend-Frontend Architecture: Employee/Owner Creation & Authentication Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  LoginPage      │  │ EmployeesPage   │  │ OwnerDashboard  │ │
│  │  (auth)         │  │ (admin creates) │  │ (owner views)   │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                     │           │
│           └────────────────────┼─────────────────────┘           │
│                                │                                  │
│                         ┌──────▼──────┐                          │
│                         │ api.js       │                          │
│                         │ (services)   │                          │
│                         └──────┬───────┘                          │
│                                │                                  │
│            authService          │ employeeService                 │
│            ownerService          │ dailyWorkService               │
│                                  │                                │
└──────────────────────────────────┼────────────────────────────────┘
                                   │
                    HTTPS / REST API calls
                                   │
┌──────────────────────────────────▼────────────────────────────────┐
│                     BACKEND (Java Spring Boot)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      REST Controllers                        │ │
│  │  • EmployeeController (POST /employees)                     │ │
│  │  • SareeOwnerController (POST /owners)                      │ │
│  │  • AuthController (POST /auth/login)                        │ │
│  └────────────┬─────────────────────────────────────────┬──────┘ │
│               │                                          │         │
│  ┌────────────▼────────────────────┐ ┌────────────────▼─────┐  │
│  │    EmployeeServiceImpl           │ │ SareeOwnerServiceImpl │  │
│  │  • createEmployee()              │ │ • createOwner()      │  │
│  │    ├─ Creates Employee entity    │ │   ├─ Creates Owner   │  │
│  │    └─ Calls AdminUserService ✅  │ │   └─ Calls AdminUser │  │
│  └──────────────┬────────────────────┘ └────────┬──────────────┘ │
│                 │                                │                 │
│                 │         ┌─────────────────────┘                 │
│                 │         │                                        │
│                 └─────┬───▼──────────────────────────┐            │
│                       │ AdminUserService             │            │
│                       │ • createEmployeeUser()       │            │
│                       │   ├─ Creates User (WORKER)   │            │
│                       │   └─ Creates UserProfile     │            │
│                       │ • createOwnerUser()          │            │
│                       │   ├─ Creates User (OWNER)    │            │
│                       │   └─ Creates UserProfile     │            │
│                       └───┬──────────────────────────┘            │
│                           │                                        │
│  ┌────────────────────────▼──────────────────────┐               │
│  │          Repositories (JPA/Hibernate)         │               │
│  │  • EmployeeRepository                         │               │
│  │  • SareeOwnerRepository                       │               │
│  │  • UserRepository                             │               │
│  │  • UserProfileRepository                      │               │
│  └────────────────────────┬──────────────────────┘               │
│                           │                                        │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                     Database / JPA
                            │
              ┌─────────────┼──────────────┐
              │             │              │
         ┌────▼────┐   ┌───▼──────┐   ┌──▼─────────┐
         │ users   │   │ employees│   │saree_owners│
         ├─────────┤   ├──────────┤   ├────────────┤
         │ id      │   │ id       │   │ id         │
         │ username│   │ name     │   │ name       │
         │ password│   │ mobile   │   │ mobile     │
         │ role    │   │ rate     │   │ status     │
         └────┬────┘   └──────────┘   └────────────┘
              │
         ┌────▼──────────┐
         │user_profiles  │
         ├───────────────┤
         │ id            │
         │ user_id   (FK)│
         │ employee_id(FK) or
         │ saree_owner_id(FK)
         └───────────────┘
```

---

## Data Flow: Employee Creation

### Step-by-Step Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Admin Opens Employee Creation Modal                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend: EmployeesPage                                         │
│  • User clicks "Add Employee" button                             │
│  • Modal displays form                                           │
│  Form fields:                                                    │
│    - Employee Name                                              │
│    - Mobile Number                                              │
│    - Joining Date                                               │
│    - Polishing Rate                                             │
│    - Password ← NEW FIELD (for login credentials)               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Admin Submits Form                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend: Form Validation                                       │
│  • Validates all fields not empty                               │
│  • Validates mobile number format                               │
│  • Validates password strength                                  │
│                                                                   │
│  Frontend: API Call                                              │
│  const payload = {                                               │
│    employeeName: "John Smith",                                   │
│    mobileNumber: "9876543211",                                   │
│    joiningDate: "2024-01-15",                                    │
│    polishingRate: 25,                                            │
│    password: "pass@123"      ← PASSWORD SENT                     │
│  }                                                               │
│                                                                   │
│  Sends: POST /api/employees                                      │
│  Headers: Authorization: Bearer [JWT_TOKEN]                      │
│  Body: JSON payload above                                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Backend Receives Request                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Controller: EmployeeController.createEmployee()                 │
│  • Receives CreateEmployeeRequestDto                            │
│  • Validates admin is logged in (JWT check)                     │
│  • Calls: employeeService.createEmployee(requestDto)            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: EmployeeServiceImpl - Create Employee                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Method: createEmployee(CreateEmployeeRequestDto requestDto)    │
│  Annotation: @Transactional ← ATOMIC OPERATION                  │
│                                                                   │
│  1. Check if mobile already exists                              │
│     if (employeeRepository.existsByMobileNumber(...))           │
│       throw DuplicateResourceException                          │
│                                                                   │
│  2. Create Employee entity                                       │
│     Employee employee = Employee.builder()                      │
│       .name(requestDto.getEmployeeName())                       │
│       .mobileNumber(requestDto.getMobileNumber())               │
│       .joiningDate(requestDto.getJoiningDate())                │
│       .polishRate(requestDto.getPolishingRate())               │
│       .status(EmployeeStatus.ACTIVE)                           │
│       .build();                                                 │
│                                                                   │
│  3. Save Employee to database                                    │
│     Employee saved = employeeRepository.save(employee);         │
│     → Database INSERT into 'employees' table                    │
│     → Returns Employee with ID generated                        │
│                                                                   │
│  4. ✅ NEW: Create User account                                 │
│     adminUserService.createEmployeeUser(                        │
│       requestDto.getMobileNumber(),  // "9876543211"            │
│       requestDto.getPassword(),       // "pass@123"             │
│       saved.getId()                   // Generated ID            │
│     );                                                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: AdminUserService - Create User Account                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Method: createEmployeeUser(String mobile, String pwd, Long id) │
│  Annotation: @Transactional                                      │
│                                                                   │
│  1. Encode password with BCrypt                                  │
│     String encodedPassword = passwordEncoder.encode(pwd);       │
│     → "pass@123" becomes: $2a$10$...encrypted...               │
│                                                                   │
│  2. Create User entity                                           │
│     User user = User.builder()                                  │
│       .mobileNumber("9876543211")  // Username for login         │
│       .password(encodedPassword)   // Hashed password            │
│       .role("WORKER")              // Role for authorization    │
│       .active(true)                                             │
│       .build();                                                 │
│                                                                   │
│  3. Save User to database                                        │
│     User savedUser = userRepository.save(user);                 │
│     → Database INSERT into 'users' table                        │
│     → Returns User with generated ID                            │
│                                                                   │
│  4. Create UserProfile linking User to Employee                 │
│     UserProfile profile = UserProfile.builder()                 │
│       .userId(savedUser.getId())   // Links to User             │
│       .employeeId(id)              // Links to Employee         │
│       .profileType("EMPLOYEE")                                  │
│       .build();                                                 │
│                                                                   │
│  5. Save UserProfile to database                                │
│     userProfileRepository.save(profile);                        │
│     → Database INSERT into 'user_profiles' table                │
│                                                                   │
│  Both operations within @Transactional block                    │
│  → If either fails, both are rolled back (atomicity)            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: Return Success Response                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  EmployeeServiceImpl returns:                                    │
│  EmployeeResponseDto {                                          │
│    employeeId: 105,                                             │
│    employeeName: "John Smith",                                  │
│    mobileNumber: "9876543211",                                  │
│    joiningDate: "2024-01-15",                                   │
│    polishingRate: 25,                                           │
│    status: "ACTIVE"                                             │
│  }                                                               │
│                                                                   │
│  HTTP Response: 200 OK                                           │
│  Response Body: EmployeeResponseDto JSON                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend Receives Success                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend: EmployeesPage                                         │
│  • Modal closes                                                  │
│  • Success notification shows                                    │
│  • Employee list refreshes                                       │
│  • New employee visible in table                                │
│                                                                   │
│  Database now contains:                                          │
│  ✅ Employee record (employees table)                            │
│  ✅ User record (users table)                                    │
│  ✅ UserProfile record (user_profiles table)                     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 8: Employee Can Now Login                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Employee goes to Login page                                     │
│  Enters:                                                         │
│    Mobile Number: 9876543211                                    │
│    Password: pass@123                                           │
│                                                                   │
│  Frontend sends: POST /api/auth/login                           │
│  Backend AuthService:                                            │
│    1. Find User by mobileNumber                                 │
│    2. Verify password with BCrypt.matches()                    │
│    3. If matches → Generate JWT token                           │
│    4. Return token to frontend                                  │
│                                                                   │
│  Frontend:                                                       │
│    • Stores token in localStorage                               │
│    • Redirects to Employee Dashboard                            │
│    • All future API calls include: Authorization: Bearer [token]
│                                                                   │
│  ✅ Employee Dashboard loads:                                   │
│    • GET /api/employees/me → Returns employee profile           │
│    • GET /api/employee-daily-working/summary → Returns work data │
│    • Dashboard displays real employee data                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### Before Fix (Incomplete)
```sql
-- Employee created but User not created
INSERT INTO employees (id, name, mobile_number, join_date, polish_rate, status)
VALUES (105, 'John Smith', '9876543211', '2024-01-15', 25, 'ACTIVE');

-- No corresponding User record!
-- Employee can't login because:
-- 1. No User record exists
-- 2. No way to authenticate
-- 3. No JWT token can be issued
```

### After Fix (Complete)
```sql
-- Transaction: All 3 created atomically or all rolled back

-- 1. Employee created
INSERT INTO employees (id, name, mobile_number, join_date, polish_rate, status)
VALUES (105, 'John Smith', '9876543211', '2024-01-15', 25, 'ACTIVE');

-- 2. User created with login credentials
INSERT INTO users (id, mobile_number, password, role, active)
VALUES (201, '9876543211', '$2a$10$...bcrypt_encrypted...', 'WORKER', true);

-- 3. UserProfile linking User to Employee
INSERT INTO user_profiles (id, user_id, employee_id, profile_type)
VALUES (301, 201, 105, 'EMPLOYEE');

-- Result: Employee can login with mobile=9876543211, password=pass@123
```

---

## Entity Relationships

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ mobileNumber    │◄─── Login username
│ password        │◄─── Hashed with bcrypt
│ role            │◄─── WORKER / SAREE_OWNER / ADMIN
│ active          │
│ userProfileId(FK)
└────────┬────────┘
         │ 1:1
         │
         │ has
         │
         ▼
┌──────────────────────┐
│   UserProfile        │
├──────────────────────┤
│ id (PK)              │
│ userId(FK) ────────►│
│ employeeId(FK) ──┐
│ sareeOwnerId(FK)─┤
│ profileType      │
└──────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌─────────────┐    ┌──────────────┐
    │  Employee   │    │ SareeOwner   │
    ├─────────────┤    ├──────────────┤
    │ id (PK)     │    │ id (PK)      │
    │ name        │    │ ownerName    │
    │ mobile      │    │ mobile       │
    │ rate        │    │ status       │
    │ status      │    └──────────────┘
    └─────────────┘
```

---

## API Endpoints

### Employee Creation (Admin Only)
```http
POST /api/employees
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json

{
  "employeeName": "John Smith",
  "mobileNumber": "9876543211",
  "joiningDate": "2024-01-15",
  "polishingRate": 25,
  "password": "pass@123"
}

Response (200 OK):
{
  "employeeId": 105,
  "employeeName": "John Smith",
  "mobileNumber": "9876543211",
  "joiningDate": "2024-01-15",
  "polishingRate": 25,
  "status": "ACTIVE"
}
```

### Owner Creation (Admin Only)
```http
POST /api/owners  (or /api/saree-owners)
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json

{
  "ownerName": "Rajesh Kumar",
  "mobileNumber": "9876543212",
  "password": "owner@123"
}

Response (200 OK):
{
  "ownerId": 205,
  "ownerName": "Rajesh Kumar",
  "mobileNumber": "9876543212",
  "ownerStatus": "ACTIVE"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "mobileNumber": "9876543211",
  "password": "pass@123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 201,
    "mobileNumber": "9876543211",
    "role": "WORKER"
  }
}
```

### Get Employee Profile (Employee Only)
```http
GET /api/employees/me
Authorization: Bearer [JWT_TOKEN]

Response (200 OK):
{
  "id": 105,
  "name": "John Smith",
  "mobileNumber": "9876543211",
  "joiningDate": "2024-01-15",
  "polishingRate": 25,
  "status": "ACTIVE"
}
```

### Get Daily Work Summary (Employee Only)
```http
POST /api/employee-daily-working/summary
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}

Response (200 OK):
[
  {
    "workDate": "2024-01-20",
    "freshCount": 12,
    "rePolishCount": 8,
    "totalCount": 20
  },
  {
    "workDate": "2024-01-21",
    "freshCount": 15,
    "rePolishCount": 5,
    "totalCount": 20
  }
]
```

---

## Security Considerations

### Password Security
- ✅ Passwords never stored in plain text
- ✅ BCryptPasswordEncoder used (automatically salted)
- ✅ 10 rounds of hashing (default bcrypt strength)
- ✅ Passwords only transmitted over HTTPS
- ✅ Password only used during User creation

### JWT Security
- ✅ Token generated after successful authentication
- ✅ Token includes user ID and role
- ✅ Token used in Authorization header for subsequent requests
- ✅ Token validation on every protected endpoint
- ✅ Token expiration (if configured)

### Atomicity & Consistency
- ✅ @Transactional ensures Employee and User created together
- ✅ If User creation fails → Employee creation rolled back
- ✅ No orphaned Employee records
- ✅ Database constraints prevent inconsistency

### Authorization
- ✅ Employee creation restricted to Admin role
- ✅ Employee dashboard restricted to Employee role
- ✅ Owner dashboard restricted to Owner role
- ✅ JWT token validates role on each request

---

## Error Scenarios

### Scenario 1: Duplicate Mobile Number
```
Admin tries to create employee with mobile already in system

Backend Response:
409 Conflict
{
  "message": "Employee with this mobile number already exists"
}

Frontend: Shows error message, form stays open for retry
```

### Scenario 2: User Creation Fails
```
Employee saved successfully, but User creation fails

Backend: @Transactional rollback triggered
- Employee record DELETED
- UserProfile deleted (if partially created)
- User deleted (if partially created)

HTTP Response: 500 Internal Server Error
Frontend: Shows "Failed to create employee" message
Admin can retry
```

### Scenario 3: Invalid Credentials at Login
```
Employee enters wrong password

Backend:
1. Find User by mobileNumber ✓
2. BCrypt.matches(provided_password, stored_hash) = false
3. Return 401 Unauthorized

Frontend:
- Shows "Invalid mobile number or password"
- Does not reveal which field is wrong (security best practice)
```

### Scenario 4: Employee Tries to Access Admin Endpoints
```
Employee tries to create another employee

Backend:
1. JWT token has role=WORKER
2. Endpoint requires role=ADMIN
3. Spring Security intercepts request
4. Return 403 Forbidden

Frontend: Redirect to appropriate dashboard
```

---

## Performance Optimization

### Database
- Indexes on:
  - `users.mobileNumber` (for login lookup)
  - `employees.mobileNumber` (for duplicate check)
  - `saree_owners.mobileNumber`
  - `user_profiles.userId`
  - `user_profiles.employeeId`
  - `user_profiles.sareeOwnerId`

### Caching Potential
- Cache employee profile (small dataset)
- Cache daily work summary (with expiration)
- Cache user role/permissions (with token)

### Database Connections
- Connection pooling configured in application.properties
- Max pool size: 10-20 connections
- Idle timeout: 5-10 minutes

---

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Production Environment              │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  HTTPS Load Balancer / Reverse Proxy │   │
│  │  (Nginx / AWS ALB)                   │   │
│  └──────────────┬───────────────────────┘   │
│                 │                            │
│    ┌────────────┼────────────┐              │
│    │            │            │              │
│  ┌─▼─┐        ┌─▼─┐        ┌─▼─┐           │
│  │BE1│        │BE2│        │BE3│ (3 copies)│
│  │   │        │   │        │   │           │
│  │ 8080       │8080│       │8080│          │
│  └───┘        └───┘        └───┘           │
│    │            │            │              │
│    └────────────┼────────────┘              │
│                 │                            │
│       ┌─────────▼─────────┐                │
│       │   Database Pool   │                │
│       │   MySQL/Postgres  │                │
│       │                   │                │
│       │  - users          │                │
│       │  - employees      │                │
│       │  - user_profiles  │                │
│       │  - (other tables) │                │
│       └───────────────────┘                │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │     Frontend (React SPA)              │   │
│  │     Static files + CDN                │   │
│  │     Served from S3 / CloudFront       │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Key Metrics & Monitoring

### Application Health
- API response time (target: < 200ms)
- Database query time (target: < 50ms)
- Error rate (target: < 0.1%)
- Authentication success rate (target: > 99.5%)

### User Metrics
- Employee creation success rate
- Login success rate
- Session duration
- Daily active users

### Database Metrics
- Connection pool usage
- Query execution time
- Slow query log
- Database size growth

### Infrastructure
- CPU usage (target: < 70%)
- Memory usage (target: < 80%)
- Disk I/O
- Network bandwidth
