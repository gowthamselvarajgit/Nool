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

### 2. Backend environment

The backend reads all secrets from environment variables. A template is provided.

```bash
cd backend
cp .env.example .env
# Edit .env and set at minimum:
#   JWT_SECRET             (long random string, ≥ 64 chars)
#   SUPER_ADMIN_MOBILE     (10-digit mobile for the first super admin)
#   SUPER_ADMIN_PASSWORD   (strong password)
#   DB_USERNAME / DB_PASSWORD
```

> The `.env` file is git-ignored. In production, set these as real OS / hosting-platform environment variables instead of using a `.env` file.

### 3. Run the backend

```bash
cd backend
./mvnw spring-boot:run            # macOS / Linux
mvnw.cmd spring-boot:run          # Windows
```

The API is served at **http://localhost:8083/api**.

On **first** startup, the application reads `SUPER_ADMIN_MOBILE` and `SUPER_ADMIN_PASSWORD` from the environment and seeds a single super-admin account. No default admin is seeded — the super admin must create administrators in-app.

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local   # optional — for local overrides only
npm install
npm run dev
```

The SPA is served at **http://localhost:5173**. In development, Vite proxies `/api` to the backend; in production, set `VITE_API_BASE_URL` to the deployed backend URL before building.

### 5. First login

| Field | Value |
| --- | --- |
| Mobile number | the `SUPER_ADMIN_MOBILE` you set in `.env` |
| Password | the `SUPER_ADMIN_PASSWORD` you set in `.env` |
| Role | `SUPER_ADMIN` |

Log in, open **Admin Management** in the sidebar, and create one or more `ADMIN` accounts for daily workshop operation.

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

| Module | Super Admin | Admin | Worker (Employee) | Saree Owner |
| --- | :---: | :---: | :---: | :---: |
| Create / disable admin accounts | ✅ | — | — | — |
| Reset admin passwords | ✅ | — | — | — |
| Workshop dashboard | ✅ | ✅ | — | — |
| Personal dashboard | — | — | ✅ | ✅ |
| Manage employees | ✅ | ✅ | — | — |
| Manage saree owners | ✅ | ✅ | — | — |
| Per-owner inventory ledger (List + Calendar view) | ✅ | ✅ | — | ✅ (own) |
| Receive / return sarees | ✅ | ✅ | — | — |
| Daily work entry | ✅ | ✅ | ✅ (own) | — |
| Attendance management | ✅ | ✅ | ✅ (read own) | — |
| Salary disbursement | ✅ | ✅ | ✅ (read own) | — |
| Owner payment disbursement | ✅ | ✅ | — | ✅ (read own) |
| Excel exports | ✅ | ✅ | ✅ (own data) | ✅ (own data) |
| Analytics | ✅ | ✅ | — | — |

**Super admin** inherits every admin capability and additionally owns the **Admin Management** screen — the only place where new administrator accounts can be created. Regular admins cannot reach the `/super-admin/**` endpoints.

The admin sidebar is organised by the natural business workflow:

1. **From the Owner** — Owners, Inventory
2. **Polish at Workshop** — Employees, Daily Work, Attendance
3. **Money** — Owner Payments, Employee Salary
4. **Insights** — Analytics

---

## Configuration

All secrets and environment-specific values are externalised to environment variables. Templates are committed at:

- `backend/.env.example`
- `frontend/.env.example`

`backend/src/main/resources/application.properties` references each variable with a `${VAR_NAME:default}` placeholder. A local `.env` file (in `backend/`) is auto-loaded by Spring via `spring.config.import`. In production, set the same variables as real OS / hosting-platform environment variables.

### Backend environment variables

| Variable | Default | Required in prod | Description |
| --- | --- | :---: | --- |
| `SERVER_PORT` | `8083` | optional | HTTP port the backend listens on |
| `JWT_SECRET` | dev-only fallback | **yes** | Signing key for JWTs. **Must be ≥ 64 chars of random data in production** — generate with `openssl rand -base64 64` |
| `JWT_EXPIRATION` | `86400000` (24h) | no | Token lifetime in milliseconds |
| `SUPER_ADMIN_MOBILE` | _empty_ | **yes** (first run) | Mobile of the seeded super-admin account |
| `SUPER_ADMIN_PASSWORD` | _empty_ | **yes** (first run) | Password for the seeded super-admin |
| `DB_URL` | `jdbc:mysql://localhost:3306/nool_db?...` | **yes** | JDBC connection string |
| `DB_USERNAME` | `root` | **yes** | Database user |
| `DB_PASSWORD` | `root` | **yes** | Database password |
| `JPA_DDL_AUTO` | `update` | **yes** | **Set to `validate` (or `none`) in production** after first deploy |
| `JPA_SHOW_SQL` | `false` | no | Echo SQL statements to logs |
| `NOOL_RATE_PER_SAREE` | `70.0` | no | Fallback owner polish rate (used only when an owner has no per-owner rate) |
| `CORS_ALLOWED_ORIGINS` | localhost dev ports | **yes** | Comma-separated list of frontend origins permitted to call the API |
| `SQL_LOG_LEVEL` / `SQL_BIND_LOG_LEVEL` | `warn` | no | Hibernate SQL log verbosity |

### Frontend environment variables (Vite)

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` (via dev proxy) | Absolute URL of the backend API in production builds (e.g. `https://api.nool.example.com/api`). Leave empty in dev — Vite proxies `/api` to the backend. |
| `BACKEND_TARGET` | `http://localhost:8083` | Dev-only: where the Vite proxy forwards `/api/*`. Not exposed to client code. |

> ⚠ **Production hardening checklist** — before going live, you must:
> 1. Generate a fresh `JWT_SECRET` (≥ 64 random chars).
> 2. Set a strong `SUPER_ADMIN_PASSWORD`.
> 3. Restrict `CORS_ALLOWED_ORIGINS` to your real frontend URL(s) only.
> 4. Switch `JPA_DDL_AUTO` to `validate` (and manage schema changes through proper migrations such as Flyway).
> 5. Run the backend over HTTPS — never expose JWTs over plain HTTP.
> 6. Use a non-root DB user with the minimum required privileges.

---

## API Surface

All REST endpoints live under `/api`. A representative set of resources:

| Resource | Base path | Highlights |
| --- | --- | --- |
| Authentication | `/api/auth` | Login, token refresh |
| **Super-admin** | **`/api/super-admin`** | **Create / list / disable admins, reset passwords (SUPER_ADMIN only)** |
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

The application is built to run **identically** in local development and in production — only the environment variables change. There are two deployable artefacts:

| Artefact | Build command | Output | Runs on |
| --- | --- | --- | --- |
| Backend JAR | `./mvnw clean package` | `backend/target/backend-0.0.1-SNAPSHOT.jar` | Any JVM 21+ host (Render, Railway, AWS EC2/ECS, Heroku, on-prem) |
| Frontend SPA bundle | `npm run build` | `frontend/dist/` (static files) | Any static host with SPA fallback (Nginx, S3+CloudFront, Netlify, Vercel) |

### Backend deployment

```bash
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

Set every variable from `backend/.env.example` as an environment variable on the hosting platform. Do **not** copy the `.env` file to production — use the platform's secrets manager instead.

Minimum required vars in production:

```
JWT_SECRET=<openssl rand -base64 64>
SUPER_ADMIN_MOBILE=<10-digit mobile>
SUPER_ADMIN_PASSWORD=<strong password>
DB_URL=<production JDBC URL>
DB_USERNAME=<non-root DB user>
DB_PASSWORD=<strong DB password>
CORS_ALLOWED_ORIGINS=https://app.your-domain.com
JPA_DDL_AUTO=validate
```

### Frontend deployment

```bash
cd frontend
# Tell the SPA where the backend is hosted:
echo "VITE_API_BASE_URL=https://api.your-domain.com/api" > .env.production
npm install
npm run build
# Upload dist/ to your static host
```

Configure the static host to serve `index.html` as a fallback for **all** unknown paths (the SPA owns routing client-side).

### Health checks & observability

- Backend exposes Spring Boot defaults; expose `/actuator/health` if you add `spring-boot-starter-actuator` to `pom.xml`.
- Watch the application logs on first deploy to confirm: `✓ SUPER_ADMIN account created for mobile <...>`.

### Rotating secrets

- `JWT_SECRET` rotation invalidates all outstanding tokens — users must log in again. Schedule this for a low-traffic window.
- Super-admin password resets happen out-of-band: stop the app, re-run `mvnw spring-boot:run` with a temporary `SUPER_ADMIN_PASSWORD`, then immediately log in and rotate it (or update the DB row directly using BCrypt encoding).

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
