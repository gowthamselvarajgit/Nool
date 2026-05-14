# NOOL — Saree Polishing Workshop ERP

> A modern, role-based enterprise resource planning system for saree-polishing workshops — purpose-built to track sarees through the receive → polish → return cycle, manage workshop payroll, and reconcile owner payments.

---

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started)
- [Domain Model](#domain-model)
- [Feature Matrix by Role](#feature-matrix-by-role)
- [Configuration](#configuration)
- [API Surface](#api-surface)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)
- [Maintainer](#maintainer)

---

## Overview

NOOL digitises the day-to-day operations of a saree-polishing workshop. The business flow it models is:

1. **Collect sarees** from one or more saree owners (each owner pays a configurable per-saree polish rate).
2. **Dispatch sarees** to workshop employees, who polish a configurable number of sarees per day (fresh + re-polish).
3. **Return** the finished sarees to owners.
4. **Invoice owners** for sarees returned, at the agreed per-owner rate.
5. **Pay employees** based on the volume of polishing work they have logged.

NOOL exposes this workflow through three distinct, secured front-ends — one per role — sharing a single Spring Boot backend with a MySQL data store.

---

## Key Capabilities

| Area | What it does |
| --- | --- |
| **Inventory ledger** | Per-owner receipts/returns recorded as immutable ledger entries, with a running "Sarees Still With Us" balance carried across weeks and months. |
| **Owner billing** | Workshop revenue computed automatically as `quantity returned × owner-specific polish rate`. Per-owner rates are first-class and editable. |
| **Employee daily work** | Per-day fresh and re-polish counts captured per employee; earnings auto-calculated from each employee's polish rate. |
| **Attendance** | Daily attendance with status (Present/Absent/Half-day/Leave) and per-employee month-view calendar. |
| **Salary disbursement** | Auto-calculated outstanding salary per employee, payment history with running totals, and a calendar view of all disbursements. |
| **Owner payments** | Same disbursement pattern for payments owed to (or by) saree owners. |
| **Dashboards** | Workshop-level KPIs for the admin, personal dashboards for employees and owners, including today's earnings, pending dues, and monthly trends. |
| **Analytics & exports** | Revenue & workforce analytics, plus Excel export for every list view. |

---

## Technology Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Java 21 · Spring Boot 4.0.6 · Spring Security · Spring Data JPA · Hibernate · JWT (jjwt 0.11.5) · Lombok · Maven |
| **Database** | MySQL 8 (`spring.jpa.hibernate.ddl-auto=update` for development) |
| **Frontend** | React 19 · Vite 8 · React Router 6 · Tailwind CSS 3 · Recharts · lucide-react · framer-motion · xlsx |
| **Auth** | JWT, HS256, 24-hour expiry, role claims (`ADMIN`, `WORKER`, `SAREE_OWNER`) |
| **Tooling** | ESLint, npm, Maven Wrapper, PostCSS, Autoprefixer |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React SPA (Vite + Tailwind)                  │
│   Role-aware routing • Per-role sidebar • REST client (fetch)    │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP + JWT (Authorization header)
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│              Spring Boot REST API  (context-path: /api)          │
│                                                                  │
│   Auth ─── Dashboard ─── Employee ─── Owner ─── Inventory        │
│     │           │            │           │            │          │
│     └───────────┴────────────┴───────────┴────────────┘          │
│                          Service layer                            │
│                                │                                  │
│                       Spring Data JPA                             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                       ┌─────────▼─────────┐
                       │     MySQL 8       │
                       │   (nool_db)       │
                       └───────────────────┘
```

- **Stateless backend.** Every authenticated request carries a signed JWT; no server-side sessions.
- **Role-based access control** enforced both server-side (Spring Security) and client-side (route guards on the SPA).
- **Single source of truth** for business state lives in the relational schema; the SPA holds only ephemeral UI state.

---

## Repository Layout

```
NOOL/
├── backend/                              Spring Boot REST API
│   ├── src/main/java/com/nool/backend/
│   │   ├── auth/                         JWT auth, user, profile
│   │   ├── controller/                   REST endpoints (dashboard, employee, owner)
│   │   ├── service/                      Business logic & service impls
│   │   ├── repository/                   Spring Data JPA repositories
│   │   ├── entity/                       JPA entities
│   │   ├── dto/                          Request / response DTOs
│   │   ├── enums/                        Domain enums (LedgerEntryType, AttendanceStatus, …)
│   │   └── exception/                    Global exception handling
│   ├── src/main/resources/
│   │   └── application.properties        DB, JWT, admin seed config
│   └── pom.xml
│
├── frontend/                             React SPA
│   ├── src/
│   │   ├── components/                   Shared UI (Layout, Common, Table, calendars)
│   │   ├── pages/                        Route-level pages (per role)
│   │   ├── services/api.js               Centralised REST client
│   │   ├── context/                      AuthContext provider
│   │   ├── hooks/                        useAuth, etc.
│   │   ├── utils/                        Formatters, validators, Excel export
│   │   └── App.jsx                       Route table
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── documents/                            Reference material, diagrams
└── README.md                             You are here
```

---

## Getting Started

### Prerequisites

| Tool | Minimum | Notes |
| --- | --- | --- |
| JDK | 21 | Required for the backend |
| Maven | 3.9+ | Wrapper (`mvnw`) is provided |
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Bundled with Node |
| MySQL | 8.x | Local instance on default port 3306 |

### 1. Database

Create the database (the application will also auto-create it on first run if permitted):

```sql
CREATE DATABASE IF NOT EXISTS nool_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Default credentials assumed by `application.properties`: user `root`, password `root`. Override via Spring properties or environment variables for non-local environments.

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run            # macOS / Linux
mvnw.cmd spring-boot:run          # Windows
```

The API is served at **http://localhost:8083/api**.

On first start, the application seeds a default administrator account:

| Field | Value |
| --- | --- |
| Mobile number | `9876543210` |
| Password | `Admin@123` |
| Role | `ADMIN` |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The SPA is served at **http://localhost:5173** and is pre-configured to call the backend at `/api`.

---

## Domain Model

| Entity | Purpose |
| --- | --- |
| `User` / `UserProfile` | Authentication credentials and profile data, role-scoped. |
| `Employee` | Workshop polisher. Owns a `polishingRate` (₹ per saree polished). |
| `Attendance` | Daily attendance record per employee, with status. |
| `EmployeeDailyWork` | Per-day fresh + re-polish counts logged for an employee. |
| `SalaryPayment` | Disbursement of salary to an employee covering a date range. |
| `SareeOwner` | A workshop client. Owns a `polishRatePerSaree` (₹ paid to workshop per returned saree). |
| `SareeLedgerEntry` | Immutable receipt or return event tied to an owner (qty + date + remarks). |
| `OwnerPayment` | Disbursement of money owed by/to an owner. |

The inventory ledger is intentionally decoupled — receipts and returns are independent events for fungible sarees, not paired transactions.

---

## Feature Matrix by Role

| Module | Admin | Worker (Employee) | Saree Owner |
| --- | :---: | :---: | :---: |
| Workshop dashboard | ✅ | — | — |
| Personal dashboard | — | ✅ | ✅ |
| Manage employees | ✅ | — | — |
| Manage saree owners | ✅ | — | — |
| Per-owner inventory ledger (List + Calendar view) | ✅ | — | ✅ (own) |
| Receive / return sarees | ✅ | — | — |
| Daily work entry | ✅ | ✅ (own) | — |
| Attendance management | ✅ | ✅ (read own) | — |
| Salary disbursement | ✅ | ✅ (read own) | — |
| Owner payment disbursement | ✅ | — | ✅ (read own) |
| Excel exports | ✅ | ✅ (own data) | ✅ (own data) |
| Analytics | ✅ | — | — |

The admin sidebar is organised by the natural business workflow:

1. **From the Owner** — Owners, Inventory
2. **Polish at Workshop** — Employees, Daily Work, Attendance
3. **Money** — Owner Payments, Employee Salary
4. **Insights** — Analytics

---

## Configuration

All backend configuration is in `backend/src/main/resources/application.properties`. Highlights:

| Property | Default | Description |
| --- | --- | --- |
| `server.port` | `8083` | HTTP port |
| `server.servlet.context-path` | `/api` | Base path for all endpoints |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/nool_db` | MySQL connection string |
| `spring.datasource.username` / `password` | `root` / `root` | DB credentials |
| `spring.jpa.hibernate.ddl-auto` | `update` | Schema is evolved on startup (development only) |
| `jwt.secret` | local development key | Override in production |
| `jwt.expiration` | `86400000` (24 h) | Token lifetime in milliseconds |
| `admin.mobile` / `admin.password` | seeded admin | Bootstrap administrator |
| `nool.rate-per-saree` | `70.0` | Fallback rate used when an owner has no per-owner rate configured |

> ⚠ **Production deployment** requires overriding `jwt.secret`, the database credentials, and the seeded admin password.

---

## API Surface

All REST endpoints live under `/api`. A representative set of resources:

| Resource | Base path | Highlights |
| --- | --- | --- |
| Authentication | `/api/auth` | Login, token refresh |
| Admin dashboard | `/api/dashboard` | Workshop-wide summary, revenue & workforce analytics |
| Employees | `/api/employees` | CRUD, status toggle, list with pagination |
| Attendance | `/api/attendance` | Mark, list, per-employee + per-period summaries |
| Daily work | `/api/employee-daily-work` | Record fresh/re-polish counts, list, summary |
| Salary payments | `/api/salary-payments` | Disburse salary, history, summary per employee |
| Saree owners | `/api/owners` | CRUD, per-owner polish rate, status |
| Saree inventory | `/api/inventory` | Add receipt, add return, owner ledger, all-owners snapshot |
| Owner payments | `/api/owner-payments` | Record payment, per-owner & all-owners summaries |

Every secured endpoint requires the header:

```
Authorization: Bearer <JWT>
```

---

## Development Workflow

### Backend

```bash
cd backend
./mvnw clean compile          # Verify it builds
./mvnw test                   # Run tests
./mvnw spring-boot:run        # Hot reload via Spring DevTools (if added)
./mvnw package                # Produce executable JAR in target/
```

### Frontend

```bash
cd frontend
npm run dev                   # Vite dev server with HMR
npm run lint                  # ESLint
npm run build                 # Production build into dist/
npm run preview               # Preview the built bundle locally
```

### Conventions

- **Time zone**: All timestamps are stored and rendered in `Asia/Kolkata` (IST).
- **Currency**: All monetary values are rendered in Indian Rupees (₹) using `Intl.NumberFormat('en-IN')`.
- **Date strings**: The frontend uses `toLocalISODate()` (in `utils/formatters.js`) to avoid the UTC-offset bug that `Date.toISOString()` introduces in IST.
- **Data integrity**: Inventory operations use pessimistic row-level locking to prevent concurrent receipt/return races.

---

## Deployment

The application is designed to be deployed as two artefacts:

1. **Backend JAR** — `backend/target/backend-0.0.1-SNAPSHOT.jar`, runnable with `java -jar` against any JVM 21+ runtime. Configure via Spring properties or environment variables.
2. **Frontend static bundle** — `frontend/dist/`, deployable to any static host (Nginx, S3 + CloudFront, Netlify, Vercel). Ensure the SPA fallback route returns `index.html` for client-side routes.

For production deployments, in addition to overriding the secrets listed under [Configuration](#configuration):

- Set `spring.jpa.hibernate.ddl-auto` to `validate` or `none` and manage migrations explicitly (e.g. via Flyway).
- Place the API behind HTTPS with proper CORS configuration.
- Rotate `jwt.secret` and force re-authentication on rotation.

---

## Roadmap

- [ ] Database migrations via Flyway / Liquibase (replacing `ddl-auto=update`).
- [ ] Audit log on inventory and payment mutations.
- [ ] Multi-workshop tenancy.
- [ ] Mobile PWA installable shell.
- [ ] Server-side report generation (PDF invoices).

---

## License

This project is delivered as the **NOOL Enterprise Resource Planning System**. All rights reserved by the owner. Reproduction, distribution, or modification without explicit permission is not permitted.

---

## Maintainer

**Gowtham Selvaraj** — Full-stack engineer, designer, and product owner of NOOL.
[GitHub: gowthamselvarajgit](https://github.com/gowthamselvarajgit) · [Repository](https://github.com/gowthamselvarajgit/Nool)

For issues and feature requests, please open a ticket on the [GitHub issue tracker](https://github.com/gowthamselvarajgit/Nool/issues).
