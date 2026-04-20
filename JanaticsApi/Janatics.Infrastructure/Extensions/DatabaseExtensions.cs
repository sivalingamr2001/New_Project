using Janatics.Application.Features.AccessRequests.Services;
using Janatics.Application.Features.Auth.Services;
using Janatics.Application.Features.Departments.Services;
using Janatics.Application.Features.Employees.Services;
using Janatics.Infrastructure.Data;
using Janatics.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Janatics.Infrastructure.Extensions;   

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var provider = configuration.GetValue<string>("DatabaseProvider") ?? "SQLite";
        var connectionString = configuration.GetConnectionString(provider)
            ?? throw new InvalidOperationException(
                $"No connection string found for provider '{provider}'.");

        services.AddDbContext<AppDbContext>(options =>
        {
            switch (provider.ToUpperInvariant())
            {
                case "MYSQL":
                    var serverVersion = ServerVersion.AutoDetect(connectionString);
                    options.UseMySql(connectionString, serverVersion, o =>
                    {
                        o.EnableRetryOnFailure(3);
                        o.CommandTimeout(30);
                    });
                    break;

                case "SQLITE":
                    options.UseSqlite(connectionString);
                    break;

                case "ORACLE":
                    options.UseOracle(connectionString, o =>
                    {
                        o.CommandTimeout(30);
                    });
                    break;

                default:
                    throw new InvalidOperationException(
                        $"Unsupported database provider: '{provider}'. " +
                        "Valid options are: MySQL, SQLite, Oracle.");
            }
        });

        // Register application services
        services.AddScoped<IAccessRequestService, AccessRequestService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IEmployeeService, EmployeeService>();

        return services;
    }
}
