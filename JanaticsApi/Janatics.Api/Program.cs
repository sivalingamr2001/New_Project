using Janatics.Api;
using Janatics.Api.Features.Auth;
using Janatics.Api.Features.Departments.Create;
using Janatics.Api.Features.Departments.Get;
using Janatics.Api.Features.Departments.Update;
using Janatics.Api.Features.Employees.Create;
using Janatics.Api.Features.Employees.Get;
using Janatics.Api.Features.Employees.Update;
using Janatics.Api.Middleware;
using Janatics.Infrastructure.Extensions;
using Janatics.Infrastructure.Seed; // Added for seeding

var builder = WebApplication.CreateBuilder(args);

// ── Add Services ──────────────────────────────────────────────────────────────

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174",      // Vite dev server
            "http://localhost:3000",      // Alternative dev port
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});


var app = builder.Build();

// ── Middleware ────────────────────────────────────────────────────────────────

app.UseExceptionHandler();
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "JanaticsApi v1");
    });
}

app.MapFeatureEndpoints();

// ── Initialize & Seed Database ───────────────────────────────────────────────

try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Starting database initialization and seeding...");

        await DatabaseSeeder.SeedAsync(services, logger);
    }

    await app.RunAsync();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"Application terminated unexpectedly: {ex}");
    Environment.Exit(1);
}
