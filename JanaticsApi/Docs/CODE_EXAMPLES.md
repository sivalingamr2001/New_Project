# Code Examples & Common Patterns

## Quick Reference Guide

### 1. Adding a New Endpoint

**Pattern for GET endpoint with pagination:**

```csharp
// In JanaticsApi.Api/Features/YourFeature/GetEndpoint.cs

public static void Map(RouteGroupBuilder group)
{
    group.MapGet("/", HandleListAsync)
        .WithName("GetItems")
        .WithSummary("Get all items with pagination")
        .WithOpenApi()
        .Produces<ApiResult<PagedResult<ItemDto>>>(StatusCodes.Status200OK);
}

private static async Task<IResult> HandleListAsync(
    [AsParameters] PagedQuery query,
    AppDbContext db,
    CancellationToken ct)
{
    query.Normalize(); // Validates page number and size

    var totalCount = await db.YourEntities.CountAsync(ct);
    
    var items = await db.YourEntities
        .AsNoTracking()
        .OrderBy(x => x.Id)
        .Skip(query.Skip)
        .Take(query.PageSize)
        .ToListAsync(ct);

    var result = new PagedResult<ItemDto>
    {
        TotalCount = totalCount,
        PageNumber = query.PageNumber,
        PageSize = query.PageSize,
        Data = items.Select(YourMapper.ToDto)
    };

    return Results.Ok(ApiResult<PagedResult<ItemDto>>.Ok(result));
}
```

**Pattern for POST endpoint with validation:**

```csharp
// In JanaticsApi.Api/Features/YourFeature/CreateEndpoint.cs

public static void Map(RouteGroupBuilder group)
{
    group.MapPost("/", HandleAsync)
        .WithName("CreateItem")
        .WithSummary("Create a new item")
        .WithOpenApi()
        .Produces<ApiResult<ItemDto>>(StatusCodes.Status201Created)
        .Produces<ApiResult<ItemDto>>(StatusCodes.Status400BadRequest);
}

private static async Task<IResult> HandleAsync(
    CreateItemRequest request,
    AppDbContext db,
    CancellationToken ct)
{
    // Validation
    var errors = ValidateRequest(request);
    if (errors.Count > 0)
        return Results.BadRequest(ApiResult<ItemDto>.Fail("Validation failed.", errors));

    // Business logic checks
    var exists = await db.YourEntities
        .AnyAsync(e => e.UniqueField == request.UniqueField, ct);
    
    if (exists)
        return Results.Conflict(
            ApiResult<ItemDto>.Fail($"Item with this field already exists."));

    var now = DateTime.UtcNow;
    var item = new YourEntity
    {
        Field1 = request.Field1,
        Field2 = request.Field2,
        CreatedOn = now,
        UpdatedOn = now
    };

    db.YourEntities.Add(item);
    await db.SaveChangesAsync(ct);

    return Results.Created(
        $"/api/yourfeature/{item.Id}",
        ApiResult<ItemDto>.Ok(YourMapper.ToDto(item), "Item created successfully."));
}

private static List<string> ValidateRequest(CreateItemRequest r)
{
    var errors = new List<string>();
    if (string.IsNullOrWhiteSpace(r.Field1)) errors.Add("Field1 is required.");
    if (string.IsNullOrWhiteSpace(r.Field2)) errors.Add("Field2 is required.");
    return errors;
}
```

**Pattern for PUT endpoint with update:**

```csharp
// In JanaticsApi.Api/Features/YourFeature/UpdateEndpoint.cs

public static void Map(RouteGroupBuilder group)
{
    group.MapPut("/{id:int}", HandleAsync)
        .WithName("UpdateItem")
        .WithSummary("Update an existing item")
        .WithOpenApi()
        .Produces<ApiResult<ItemDto>>(StatusCodes.Status200OK)
        .Produces<ApiResult<ItemDto>>(StatusCodes.Status404NotFound)
        .Produces<ApiResult<ItemDto>>(StatusCodes.Status400BadRequest);
}

private static async Task<IResult> HandleAsync(
    int id,
    UpdateItemRequest request,
    AppDbContext db,
    CancellationToken ct)
{
    // Find entity
    var item = await db.YourEntities.FindAsync([id], ct);
    
    if (item is null)
        return Results.NotFound(
            ApiResult<ItemDto>.Fail($"Item with ID {id} not found."));

    // Validate
    var errors = ValidateRequest(request);
    if (errors.Count > 0)
        return Results.BadRequest(ApiResult<ItemDto>.Fail("Validation failed.", errors));

    // Update
    item.Field1 = request.Field1;
    item.Field2 = request.Field2;
    item.UpdatedOn = DateTime.UtcNow;

    await db.SaveChangesAsync(ct);

    // Re-fetch with includes
    var updated = await db.YourEntities
        .AsNoTracking()
        .FirstAsync(x => x.Id == id, ct);

    return Results.Ok(ApiResult<ItemDto>.Ok(
        YourMapper.ToDto(updated), "Item updated successfully."));
}

private static List<string> ValidateRequest(UpdateItemRequest r)
{
    var errors = new List<string>();
    if (string.IsNullOrWhiteSpace(r.Field1)) errors.Add("Field1 is required.");
    if (string.IsNullOrWhiteSpace(r.Field2)) errors.Add("Field2 is required.");
    return errors;
}
```

### 2. Creating DTOs

**Request DTO with Records:**

```csharp
namespace JanaticsApi.Application.Features.YourFeature.Dtos;

public record CreateYourEntityRequest(
    string Name,
    string Email,
    int DepartmentId,
    string? OptionalField = null
);

public record UpdateYourEntityRequest(
    string Name,
    string Email,
    bool IsActive,
    int DepartmentId
);
```

**Response DTO with Records:**

```csharp
public record YourEntityDto(
    int Id,
    string Name,
    string Email,
    bool IsActive,
    DateTime CreatedOn,
    DateTime UpdatedOn,
    int DepartmentId,
    DepartmentSummaryDto? Department
);

public record DepartmentSummaryDto(
    int Id,
    string Name
);
```

### 3. Creating Mappers

**Simple Mapper:**

```csharp
using JanaticsApi.Domain.Entities;

namespace JanaticsApi.Application.Features.YourFeature.Mappers;

public static class YourEntityMapper
{
    public static YourEntityDto ToDto(YourEntity e) => new(
        e.Id,
        e.Name,
        e.Email,
        e.IsActive,
        e.CreatedOn,
        e.UpdatedOn,
        e.DepartmentId,
        e.Department is null ? null : new DepartmentSummaryDto(
            e.Department.Id,
            e.Department.Name)
    );

    // For nested relationships
    public static IEnumerable<YourEntityDto> ToDtos(IEnumerable<YourEntity> entities) =>
        entities.Select(ToDto);
}
```

### 4. Entity Configuration in DbContext

**Entity with Foreign Key:**

```csharp
// In AppDbContext.OnModelCreating

modelBuilder.Entity<YourEntity>(e =>
{
    e.ToTable("Your_Table_Name");
    e.HasKey(x => x.Id);

    // Property configurations
    e.Property(x => x.Id).ValueGeneratedOnAdd();
    e.Property(x => x.Name).IsRequired().HasMaxLength(100);
    e.Property(x => x.Email).IsRequired().HasMaxLength(150);
    e.Property(x => x.IsActive).HasDefaultValue(true);
    e.Property(x => x.CreatedOn).IsRequired();
    e.Property(x => x.UpdatedOn).IsRequired();

    // Indexes
    e.HasIndex(x => x.Email).IsUnique();

    // Relationships
    e.HasOne(x => x.Department)
     .WithMany(d => d.YourEntities)
     .HasForeignKey(x => x.DepartmentId)
     .OnDelete(DeleteBehavior.Restrict);
});
```

### 5. Registering Routes in Program.cs

```csharp
// In Program.cs

var api = app.MapGroup("/api").WithOpenApi();

// Feature group
var yourFeature = api.MapGroup("/yourfeature");
GetYourEntitiesEndpoint.Map(yourFeature);
CreateYourEntityEndpoint.Map(yourFeature);
UpdateYourEntityEndpoint.Map(yourFeature);

// With route prefixes
var admin = api.MapGroup("/admin")
    .AddEndpointFilter(async (context, next) =>
    {
        // Can add authorization checks here
        return await next(context);
    });
```

### 6. Error Handling Patterns

**Validation Error Response:**

```csharp
var errors = new List<string> 
{ 
    "Email is invalid",
    "Password must be at least 8 characters"
};

return Results.BadRequest(
    ApiResult<ItemDto>.Fail("Validation failed.", errors)
);

// Response:
// {
//   "success": false,
//   "message": "Validation failed.",
//   "errors": ["Email is invalid", "Password must be at least 8 characters"],
//   "data": null
// }
```

**Not Found Error:**

```csharp
return Results.NotFound(
    ApiResult<ItemDto>.Fail($"Item with ID {id} not found.")
);

// Response:
// {
//   "success": false,
//   "message": "Item with ID 999 not found.",
//   "errors": null,
//   "data": null
// }
```

**Success Response:**

```csharp
return Results.Ok(
    ApiResult<ItemDto>.Ok(
        itemDto, 
        "Item retrieved successfully."
    )
);

// Response:
// {
//   "success": true,
//   "message": "Item retrieved successfully.",
//   "data": { ...itemDto },
//   "errors": null
// }
```

### 7. Query Patterns

**Filter and Include:**

```csharp
var items = await db.YourEntities
    .AsNoTracking()
    .Where(x => x.IsActive) // Filter
    .Include(x => x.Department) // Load related data
    .ThenInclude(d => d.Hod) // Nested include
    .OrderBy(x => x.CreatedOn)
    .ToListAsync(ct);
```

**Pagination:**

```csharp
var query = new PagedQuery { PageNumber = 1, PageSize = 10 };
query.Normalize(); // Validate and cap page size

var totalCount = await db.YourEntities.CountAsync(ct);

var items = await db.YourEntities
    .Skip(query.Skip) // (PageNumber - 1) * PageSize
    .Take(query.PageSize)
    .ToListAsync(ct);

return new PagedResult<ItemDto>
{
    TotalCount = totalCount,
    PageNumber = query.PageNumber,
    PageSize = query.PageSize,
    Data = items.Select(Mapper.ToDto),
    // Calculated properties
    // TotalPages, HasPreviousPage, HasNextPage
};
```

**Eager Loading to Prevent N+1 Queries:**

```csharp
// GOOD - Single query with includes
var employees = await db.Employees
    .Include(e => e.Department)
        .ThenInclude(d => d.Hod)
    .ToListAsync(ct);

// BAD - N+1 query problem
var employees = await db.Employees.ToListAsync(ct);
foreach (var emp in employees)
{
    var dept = await db.Departments
        .FirstAsync(d => d.Id == emp.DepartmentId); // N queries!
}
```

### 8. Async/Await Pattern

```csharp
// Correct - Always use async methods
private static async Task<IResult> HandleAsync(
    int id,
    AppDbContext db,
    CancellationToken ct)
{
    var item = await db.YourEntities.FindAsync([id], ct);
    
    if (item is null)
        return Results.NotFound(...);

    item.Field = "New Value";
    await db.SaveChangesAsync(ct);
    
    return Results.Ok(...);
}

// Wrong - Don't block with .Result or .Wait()
var item = db.YourEntities.FindAsync(id).Result; // BLOCKS!
```

### 9. Dependency Injection Pattern

```csharp
// In Program.cs
builder.Services.AddDatabase(builder.Configuration);

// Usage in endpoints
private static async Task<IResult> HandleAsync(
    CreateItemRequest request,
    AppDbContext db,              // Injected
    ILogger<Program> logger,       // Injected
    CancellationToken ct)
{
    logger.LogInformation("Processing request for {Field}", request.Field1);
    // Use db context
}
```

### 10. CORS Configuration

```csharp
// In Program.cs

// Allow all origins (development only!)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Restricted CORS (production)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins("https://example.com", "https://app.example.com")
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .WithHeaders("Content-Type", "Authorization")
              .AllowCredentials();
    });
});

// Apply middleware
app.UseCors("AllowAll");
```

### 11. Database Transaction Pattern

```csharp
using var transaction = await db.Database.BeginTransactionAsync(ct);

try
{
    // Multiple operations
    db.Employees.Add(employee1);
    await db.SaveChangesAsync(ct);
    
    db.Departments.Add(department);
    await db.SaveChangesAsync(ct);
    
    await transaction.CommitAsync(ct);
}
catch
{
    await transaction.RollbackAsync(ct);
    throw;
}
```

### 12. Soft Delete Pattern (Optional Enhancement)

```csharp
// Add IsDeleted property to entity
public class YourEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedOn { get; set; }
}

// In DbContext - Filter deleted records globally
modelBuilder.Entity<YourEntity>(e =>
{
    e.HasQueryFilter(x => !x.IsDeleted);
});

// To delete
entity.IsDeleted = true;
entity.DeletedOn = DateTime.UtcNow;
await db.SaveChangesAsync();

// To restore
entity.IsDeleted = false;
entity.DeletedOn = null;
await db.SaveChangesAsync();
```

## Testing Examples

### Unit Test with Mock

```csharp
using Xunit;
using Moq;

public class EmployeeEndpointTests
{
    [Fact]
    public async Task GetEmployee_WithValidId_ReturnsOk()
    {
        // Arrange
        var mockDb = new Mock<AppDbContext>();
        var employee = new Employee 
        { 
            EmployeeId = 1, 
            FirstName = "John",
            LastName = "Doe"
        };
        
        mockDb.Setup(db => db.Employees
            .FindAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        // Act
        var result = await GetEmployeesEndpoint.HandleGetByIdAsync(
            1, mockDb.Object, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        mockDb.Verify(db => db.Employees.FindAsync(
            It.Is<object[]>(x => x[0].Equals(1)), 
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }
}
```

---

**For more detailed information, see ARCHITECTURE.md and IMPLEMENTATION.md**
