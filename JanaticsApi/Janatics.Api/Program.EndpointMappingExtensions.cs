using Janatics.Api.Features.Auth;
using Janatics.Api.Features.Budget;
using Janatics.Api.Features.Departments.Create;
using Janatics.Api.Features.Departments.Get;
using Janatics.Api.Features.Departments.Update;
using Janatics.Api.Features.Employees.Create;
using Janatics.Api.Features.Employees.Get;
using Janatics.Api.Features.Employees.Update;
using Janatics.Api.Features.AccessRequests;
using Janatics.Api.Features.Dashboard;
using Janatics.Api.Features.AuditLogs;
using Janatics.Api.Features.Notifications;

namespace Janatics.Api;

public static class EndpointMappingExtensions
{
    public static IEndpointRouteBuilder MapFeatureEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api").WithOpenApi();

        var auth = api.MapGroup("/auth");
        auth.MapAuthEndpoints();

        var employees = api.MapGroup("/employees");
        GetEmployeesEndpoint.Map(employees);
        CreateEmployeeEndpoint.Map(employees);
        UpdateEmployeeEndpoint.Map(employees);

        var departments = api.MapGroup("/departments");
        GetDepartmentsEndpoint.Map(departments);
        CreateDepartmentEndpoint.Map(departments);
        UpdateDepartmentEndpoint.Map(departments);

        var accessRequests = api.MapGroup("/access-requests");
        AccessRequestEndpoints.Map(accessRequests);

        var dashboard = api.MapGroup("/dashboard");
        DashboardEndpoints.Map(dashboard);

        var auditLogs = api.MapGroup("/audit-logs");
        AuditLogEndpoints.Map(auditLogs);

        var notifications = api.MapGroup("/notifications");
        NotificationEndpoints.Map(notifications);

        var budgets = api.MapGroup("/budgets");
        ActualAmountsEndpoints.Map(budgets);

        app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
            .WithName("HealthCheck")
            .WithOpenApi();

        return app;
    }
}
