# JanaticsApi - Clean Architecture Implementation Guide

## Overview

This document provides a comprehensive guide to the JanaticsApi project structure, built using clean architecture principles and .NET best practices.

## Architecture Layers

### 1. Domain Layer (`JanaticsApi.Domain`)
**Purpose**: Contains core business logic and entity definitions.

**Key Components**:
- **Entities**: `Employee.cs`, `Department.cs`
  - Pure domain models with no dependencies on external frameworks
  - Represent the core business concepts
  - Define relationships between entities

**Characteristics**:
- No dependencies on other projects (except to other domain projects if they exist)
- No Entity Framework or database logic
- Purely C# domain models

### 2. Infrastructure Layer (`JanaticsApi.Infrastructure`)
**Purpose**: Handles technical concerns like data access and external services.

**Key Components**:
- **Data**:
  - `AppDbContext.cs`: Entity Framework Core DbContext
  - Configured with fluent API for table mapping and relationships
  - Supports SQLite, MySQL, and SQL Server

- **Extensions**:
  - `DatabaseExtensions.cs`: Dependency injection and database initialization
  - Multi-database provider support
  - Automatic migrations and seeding

**Characteristics**:
- Depends on the Domain layer
- Handles all database operations
- Contains configuration for different database providers

### 3. Application Layer (`JanaticsApi.Application`)
**Purpose**: Contains DTOs, mappers, and application logic.

**Key Components**:
- **Common/Models**:
  - `ApiResult<T>`: Generic wrapper for all API responses
  - `PagedResult<T>`: Pagination support
  - `PagedQuery`: Pagination parameters

- **Features**:
  - **Auth**: Authentication DTOs (RegisterRequest, LoginRequest, AuthResponse)
  - **Employees**: DTOs for employee operations and mapping logic
  - **Departments**: DTOs for department operations and mapping logic

**Characteristics**:
- Depends on the Domain layer
- Contains no business logic beyond DTO transformations
- Mappers convert domain entities to DTOs

### 4. API Layer (`JanaticsApi.Api`)
**Purpose**: REST API endpoints and application configuration.

**Key Components**:
- **Features**:
  - **Auth**: Authentication endpoints (`AuthEndpoints.cs`)
  - **Employees**: CRUD operations (Get, Create, Update)
  - **Departments**: CRUD operations (Get, Create, Update)

- **Configuration**:
  - `Program.cs`: Application entry point and configuration
  - `appsettings.json`: Configuration for production
  - `appsettings.Development.json`: Configuration for development
  - `Properties/launchSettings.json`: Launch profiles

**Characteristics**:
- Depends on all other layers
- Handles HTTP requests/responses
- Configures dependency injection

## Clean Architecture Benefits

### Separation of Concerns
- Each layer has a single, well-defined responsibility
- Easy to understand and maintain
- Changes in one layer don't affect others

### Testability
- Dependencies are injected, enabling easy mocking
- Core business logic (Domain) is testable without infrastructure
- DTOs separate API contracts from domain models

### Flexibility
- Easy to swap database providers
- UI can be changed without affecting business logic
- External services can be added independently

### Maintainability
- Code organization is intuitive
- New developers can understand the structure quickly
- Future changes are isolated to specific layers

## API Patterns Used

### 1. Minimal APIs
- Lightweight endpoint mapping in `Program.cs`
- No controller classes needed
- Type-safe route parameter handling

### 2. Result Pattern
```csharp
public class ApiResult<T>
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public T? Data { get; init; }
    public IEnumerable<string>? Errors { get; init; }
}
```
- Consistent response format across all endpoints
- Supports error messages and data validation errors

### 3. DTO Pattern
- Decouples API contracts from domain entities
- Allows independent evolution of API and domain
- Provides validation and transformation layer

### 4. Mapper Pattern
- Centralizes transformation logic
- Keeps DTOs simple
- Static mappers for zero allocation

### 5. Pagination Pattern
```csharp
public class PagedQuery
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int Skip => (PageNumber - 1) * PageSize;
}
```
- Efficient data retrieval
- Configurable page size with cap (max 100)

## Database Design

### Tables

**Jan_Emp_Mast (Employees)**
- Stores employee information
- Foreign key to Jan_Dept_Mast
- Unique constraint on Username

**Jan_Dept_Mast (Departments)**
- Stores department information
- Optional foreign key to Jan_Emp_Mast for HOD

### Relationships
- Many employees per department
- One HOD per department (optional)
- Delete protection: Cannot delete department with employees

## Development Workflow

### 1. Adding a New Feature

#### Step 1: Define Domain Entity (if needed)
```csharp
// In JanaticsApi.Domain/Entities
public class NewEntity
{
    public int Id { get; set; }
    // ... properties
}
```

#### Step 2: Create DTOs
```csharp
// In JanaticsApi.Application/Features/NewFeature/Dtos
public record CreateNewEntityRequest(...);
public record NewEntityDto(...);
```

#### Step 3: Create Mapper
```csharp
// In JanaticsApi.Application/Features/NewFeature/Mappers
public static class NewEntityMapper
{
    public static NewEntityDto ToDto(NewEntity e) => new(...);
}
```

#### Step 4: Add DbSet to Context
```csharp
// In JanaticsApi.Infrastructure/Data/AppDbContext.cs
public DbSet<NewEntity> NewEntities => Set<NewEntity>();
```

#### Step 5: Configure in OnModelCreating
```csharp
// In AppDbContext.OnModelCreating
modelBuilder.Entity<NewEntity>(e =>
{
    e.ToTable("Table_Name");
    e.HasKey(x => x.Id);
    // ... configuration
});
```

#### Step 6: Create Endpoint
```csharp
// In JanaticsApi.Api/Features/NewFeature
public static void Map(RouteGroupBuilder group)
{
    group.MapGet("/", HandleAsync)
        .WithName("GetNewEntities")
        .WithSummary("Get all new entities")
        .WithOpenApi();
}
```

#### Step 7: Register Route
```csharp
// In Program.cs
var newEntities = api.MapGroup("/newentities");
NewEntityEndpoint.Map(newEntities);
```

### 2. Database Migrations

For custom migrations with EF Core:

```bash
# Install Entity Framework Core CLI
dotnet tool install --global dotnet-ef

# Add migration from JanaticsApi.Api directory
dotnet ef migrations add MigrationName -p ../JanaticsApi.Infrastructure

# Update database
dotnet ef database update -p ../JanaticsApi.Infrastructure
```

## Configuration

### Supported Database Providers

**SQLite** (Default)
- Lightweight, file-based
- Perfect for development and testing
- Configuration: `"Data Source=JanaticsApi.db"`

**MySQL**
- Production-ready
- Configuration: `"Server=localhost;Database=janatics_api;Uid=root;Pwd=password;"`

**SQL Server**
- Enterprise option
- Configuration: `"Server=.;Database=JanaticsApi;Trusted_Connection=True;TrustServerCertificate=True;"`

### Selecting a Provider

Set `DatabaseProvider` in `appsettings.json`:
```json
{
  "DatabaseProvider": "SQLite",  // or "MySQL" or "SQLServer"
  "ConnectionStrings": { ... }
}
```

## Error Handling

### Validation Errors
```csharp
var errors = new List<string> { "Field required", "Invalid format" };
return Results.BadRequest(ApiResult<T>.Fail("Validation failed.", errors));
```

### Not Found
```csharp
return Results.NotFound(ApiResult<T>.Fail("Resource not found."));
```

### Conflict (e.g., duplicate)
```csharp
return Results.Conflict(ApiResult<T>.Fail("Resource already exists."));
```

## Security Considerations

### Current Implementation
- Basic authentication with username/password
- Password stored in plain text (⚠️ Not for production!)

### Recommended Improvements
1. **Password Hashing**: Use BCrypt or PBKDF2
   ```csharp
   password = BCrypt.Net.BCrypt.HashPassword(password);
   ```

2. **JWT Tokens**: Implement token-based authentication
   ```csharp
   var token = GenerateJwtToken(employee);
   return Ok(new { token });
   ```

3. **Authorization**: Add role-based access control (RBAC)
   ```csharp
   [Authorize(Roles = "Admin")]
   ```

4. **HTTPS**: Always use HTTPS in production

5. **Input Validation**: Validate and sanitize all inputs

6. **Rate Limiting**: Protect against brute force attacks

7. **CORS**: Configure CORS restrictions for production

## Performance Optimization

### Current Implementation
- `AsNoTracking()`: Improves read performance
- Pagination: Prevents loading entire datasets
- Index on Username: Fast lookups

### Recommended Improvements
1. **Caching**: Add Redis for frequently accessed data
2. **Async/Await**: All I/O operations are async
3. **Batch Operations**: For bulk inserts/updates
4. **Query Optimization**: Use projection to select only needed fields
5. **Connection Pooling**: Automatically handled by EF Core

## Testing

### Unit Testing Example
```csharp
[Fact]
public async Task CreateEmployee_WithValidData_ReturnsCreated()
{
    // Arrange
    var request = new CreateEmployeeRequest(...);
    var mockDb = new Mock<AppDbContext>();

    // Act
    var result = await CreateEmployeeEndpoint.HandleAsync(request, mockDb.Object, CancellationToken.None);

    // Assert
    Assert.NotNull(result);
}
```

### Integration Testing
- Use `WebApplicationFactory<Program>` for testing the full pipeline
- Create test database with sample data
- Test actual HTTP requests

## Deployment

### Build
```bash
dotnet build -c Release
```

### Publish
```bash
dotnet publish -c Release -o ./publish
```

### Docker
Create `Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "JanaticsApi.Api.dll"]
```

Build and run:
```bash
docker build -t janatics-api .
docker run -p 8080:8080 janatics-api
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check connection string
   - Verify database server is running
   - Check firewall settings

2. **Port Already in Use**
   - Change port in `launchSettings.json`
   - Or kill process using the port

3. **Swagger Not Showing**
   - Ensure `ASPNETCORE_ENVIRONMENT=Development`
   - Clear browser cache

4. **Null Reference Exception**
   - Check if `Include()` is used for navigation properties
   - Verify foreign keys are loaded

## Resources

- [Microsoft Docs - Clean Architecture](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/)
- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Best Practices](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/best-practices)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
