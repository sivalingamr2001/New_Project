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
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ── Middleware ────────────────────────────────────────────────────────────────

app.UseExceptionHandler();
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "JanaticsApi v1");
    });
}

app.UseHttpsRedirection();
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
