# Janatics API

A clean architecture .NET API for managing employees and departments with role-based access control.

## Features

- **Employee Management**: Create, read, update employees
- **Department Management**: Manage departments with HOD assignments
- **Authentication**: Login and registration endpoints
- **Pagination**: Support for paginated results
- **Multi-Database Support**: SQLite, MySQL, SQL Server
- **Swagger/OpenAPI**: Auto-generated API documentation
- **Clean Architecture**: Layered project structure with separation of concerns

## Project Structure

```
JanaticsApi/
├── JanaticsApi.Domain/              # Domain entities and business rules
│   └── Entities/
│       ├── Employee.cs
│       └── Department.cs
├── JanaticsApi.Infrastructure/      # Data access and external services
│   ├── Data/
│   │   └── AppDbContext.cs
│   └── Extensions/
│       └── DatabaseExtensions.cs
├── JanaticsApi.Application/         # DTOs, Mappers, business logic
│   ├── Common/Models/
│   │   └── ApiResult.cs
│   └── Features/
│       ├── Auth/Dtos/
│       ├── Employees/Dtos & Mappers
│       └── Departments/Dtos & Mappers
└── JanaticsApi.Api/                 # REST API endpoints and configuration
    ├── Features/
    │   ├── Auth/
    │   ├── Employees/
    │   └── Departments/
    └── Program.cs
```

## Getting Started

### Prerequisites

- .NET 8.0 SDK or later
- Visual Studio 2022 or VS Code

### Installation

1. Clone the repository
2. Navigate to the project root directory
3. Restore dependencies:
   ```bash
   dotnet restore
   ```

### Running the Application

1. **From Visual Studio:**
   - Open `JanaticsApi.sln`
   - Set `JanaticsApi.Api` as the startup project
   - Press F5 or click Run

2. **From Command Line:**
   ```bash
   cd JanaticsApi.Api
   dotnet run
   ```

3. The API will start on `https://localhost:7223` (HTTPS) or `http://localhost:5167` (HTTP)

### Accessing the API Documentation

- Swagger UI: `https://localhost:7223/swagger`
- OpenAPI JSON: `https://localhost:7223/openapi/v1.json`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new employee
- `POST /api/auth/login` - Login with username and password

### Employees
- `GET /api/employees` - Get all employees (with pagination)
- `GET /api/employees/{id}` - Get employee by ID
- `POST /api/employees` - Create a new employee
- `PUT /api/employees/{id}` - Update an existing employee

### Departments
- `GET /api/departments` - Get all departments (with pagination)
- `GET /api/departments/{id}` - Get department by ID
- `POST /api/departments` - Create a new department
- `PUT /api/departments/{id}` - Update an existing department

### Health Check
- `GET /health` - API health status

## Configuration

### Database Configuration

Edit `appsettings.json` to configure the database provider:

```json
{
  "DatabaseProvider": "SQLite",
  "ConnectionStrings": {
    "SQLite": "Data Source=JanaticsApi.db",
    "MySQL": "Server=localhost;Database=janatics_api;Uid=root;Pwd=password;",
    "SQLServer": "Server=.;Database=JanaticsApi;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

Supported providers: `SQLite`, `MySQL`, `SQLServer`

## Database Initialization

The application automatically:
1. Creates the database schema on first run
2. Seeds initial data (admin user, sample departments)
3. Migrates schema changes

## Default Users

After initial seeding:
- **Admin**: Username `admin`, Password `Admin@123`
- **HOD**: Username `rajesh.kumar`, Password `Hod@123`
- **Employee**: Username `priya.sharma`, Password `Emp@123`

> ⚠️ Change these credentials in production!

## Architecture Principles

### Clean Architecture
- **Separation of Concerns**: Each layer has a single responsibility
- **Dependency Injection**: All dependencies are injected via the DI container
- **Testability**: Minimal APIs and dependency injection enable unit testing

### Best Practices
- **Entity Framework Core**: ORM for database access with strong typing
- **DTO Pattern**: Data Transfer Objects separate domain models from API contracts
- **Validation**: Input validation at endpoint level
- **Error Handling**: Consistent API result wrapper for all responses
- **Pagination**: Efficient data retrieval with configurable page size
- **CORS**: Pre-configured for cross-origin requests

## Database Schema

### Jan_Emp_Mast (Employees)
```
EmployeeId (PK)
FirstName
LastName
Username (Unique)
Password
Email
Mobile
Location
Role
IsActive
CreatedOn
UpdatedOn
ModifiedOn
ModifiedBy
DepartmentId (FK)
```

### Jan_Dept_Mast (Departments)
```
DepartmentId (PK)
DepartmentName
HodId (FK to Employees)
CreatedOn
UpdatedOn
ModifiedOn
ModifiedBy
```

## Common Issues & Troubleshooting

### Database Error on First Run
- Ensure the database file path is writable (for SQLite)
- Check connection strings for other database providers

### Port Already in Use
- The default ports are 5167 (HTTP) and 7223 (HTTPS)
- Modify `launchSettings.json` to use different ports

### Swagger Not Loading
- Ensure `ASPNETCORE_ENVIRONMENT` is set to `Development`
- Clear browser cache and hard refresh

## Contributing

1. Create a feature branch
2. Make your changes
3. Test the changes
4. Submit a pull request

## License

This project is provided as-is for educational purposes.

## Support

For issues and questions, please refer to the documentation or contact the development team.
