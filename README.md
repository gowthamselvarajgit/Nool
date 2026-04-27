# NOOL - Backend Application

A Spring Boot 4.0.6 backend application for managing employee attendance, payments, and saree transactions.

## 📋 Project Overview

NOOL is an enterprise resource planning (ERP) system designed to manage:
- **Employee Management** - Track employee information and status
- **Attendance Tracking** - Monitor employee attendance with various status types
- **Salary & Payment Management** - Handle salary payments and owner payments
- **Saree Transactions** - Manage saree-related business transactions
- **User Management** - Secure user authentication and profile management

## 🛠️ Technology Stack

- **Framework**: Spring Boot 4.0.6
- **Language**: Java 21
- **Build Tool**: Maven
- **Database ORM**: Spring Data JPA
- **Security**: Spring Security
- **Validation**: Spring Validation Framework
- **API**: Spring Web MVC

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/nool/backend/
│   │   │   ├── BackendApplication.java          # Main Spring Boot application entry point
│   │   │   ├── config/                           # Configuration classes
│   │   │   ├── controller/                       # REST API controllers
│   │   │   ├── dto/                              # Data Transfer Objects
│   │   │   ├── entity/                           # JPA entities
│   │   │   │   ├── Attendance.java
│   │   │   │   ├── Employee.java
│   │   │   │   ├── EmployeeDailyWork.java
│   │   │   │   ├── OwnerPayment.java
│   │   │   │   ├── SalaryPayment.java
│   │   │   │   ├── SareeOwner.java
│   │   │   │   ├── SareeTransaction.java
│   │   │   │   ├── User.java
│   │   │   │   └── UserProfile.java
│   │   │   ├── enums/                           # Enumeration classes
│   │   │   │   ├── AttendanceStatus.java
│   │   │   │   ├── EmployeeStatus.java
│   │   │   │   ├── PaymentMode.java
│   │   │   │   └── Role.java
│   │   │   ├── exception/                       # Custom exception classes
│   │   │   ├── repository/                      # Spring Data JPA repositories
│   │   │   ├── service/                         # Business logic services
│   │   │   │   └── impl/                        # Service implementations
│   │   │   └── util/                            # Utility classes
│   │   └── resources/
│   │       ├── application.properties           # Application configuration
│   │       ├── static/                          # Static resources
│   │       └── templates/                       # Template files
│   └── test/
│       └── java/com/nool/backend/
│           └── BackendApplicationTests.java     # Application tests
├── pom.xml                                       # Maven project configuration
├── mvnw                                          # Maven wrapper (Linux/Mac)
├── mvnw.cmd                                      # Maven wrapper (Windows)
└── HELP.md                                       # Additional help documentation
```

## 🚀 Getting Started

### Prerequisites

- Java 21 or higher
- Maven 3.6+ (or use the included Maven wrapper)
- A relational database (configured in `application.properties`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NOOL/backend
   ```

2. **Configure the database**
   
   Update `src/main/resources/application.properties` with your database credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/nool_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Build the application**
   
   Using Maven wrapper (Windows):
   ```bash
   mvnw.cmd clean install
   ```
   
   Using Maven wrapper (Linux/Mac):
   ```bash
   ./mvnw clean install
   ```

4. **Run the application**
   
   Using Maven wrapper (Windows):
   ```bash
   mvnw.cmd spring-boot:run
   ```
   
   Using Maven wrapper (Linux/Mac):
   ```bash
   ./mvnw spring-boot:run
   ```

The application will start on the default port specified in your `application.properties` file (typically `http://localhost:8080`).

## 📚 Core Entities

### User Management
- **User** - Core user account entity with authentication credentials
- **UserProfile** - Extended user profile information
- **Role** - User roles enumeration (Admin, Employee, Owner, etc.)

### Employee Management
- **Employee** - Employee records with status tracking
- **EmployeeStatus** - Employee status enumeration (Active, Inactive, On Leave, etc.)
- **EmployeeDailyWork** - Daily work records for employees

### Attendance
- **Attendance** - Attendance records for tracking
- **AttendanceStatus** - Attendance status enumeration (Present, Absent, Leave, etc.)

### Financial Management
- **SalaryPayment** - Salary payment records
- **OwnerPayment** - Owner payment records
- **PaymentMode** - Payment method enumeration (Cash, Bank Transfer, Check, etc.)

### Saree Business
- **SareeOwner** - Saree owner information
- **SareeTransaction** - Saree transaction records

## 🔒 Security

The application uses **Spring Security** for authentication and authorization. Key security features:
- User authentication with role-based access control
- Password validation and management
- Secure endpoint protection

## 📝 API Documentation

API endpoints are organized by resource:
- Employee Management endpoints (CRUD operations)
- Attendance endpoints
- Payment endpoints
- Saree Transaction endpoints
- User Management endpoints

Detailed API documentation will be available once the controllers are fully implemented.

## 🧪 Testing

Run the test suite using Maven:

```bash
mvnw.cmd test        # Windows
./mvnw test          # Linux/Mac
```

## 🔧 Configuration

Key configuration files:
- `pom.xml` - Maven dependencies and build configuration
- `application.properties` - Spring Boot application settings

## 📋 Environment Variables

Configure the following in `application.properties`:

```properties
spring.application.name=backend
spring.datasource.url=your_database_url
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

## 🤝 Contributing

This is an in-progress project. When contributing:
1. Follow Spring Boot and Java best practices
2. Maintain consistent code formatting
3. Write unit tests for new features
4. Document public APIs and complex logic

## 📄 License

*To be defined*

## 👥 Team

*Developer information to be added*

## 📞 Support

For issues and questions related to the NOOL backend application, please refer to the `HELP.md` file or create an issue in the repository.

---

**Project Status**: 🚧 In Progress

*Last Updated: April 2026*
