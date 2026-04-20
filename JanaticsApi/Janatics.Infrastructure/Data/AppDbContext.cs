using Janatics.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Janatics.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<AccessRequestEntity> AccessRequests => Set<AccessRequestEntity>();
    public DbSet<AccessItemEntity> AccessItems => Set<AccessItemEntity>();
    public DbSet<AccessApprovalEntity> AccessApprovals => Set<AccessApprovalEntity>();
    public DbSet<AccessReqAuditEntity> AccessAuditLogs => Set<AccessReqAuditEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Employee ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Employee>(e =>
        {
            e.ToTable("Jan_Emp_Mast");
            e.HasKey(x => x.EmployeeId);

            e.Property(x => x.EmployeeId).ValueGeneratedOnAdd();
            e.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
            e.Property(x => x.LastName).IsRequired().HasMaxLength(100);
            e.Property(x => x.Username).IsRequired().HasMaxLength(50);
            e.Property(x => x.Password).IsRequired().HasMaxLength(255);
            e.Property(x => x.Email).IsRequired().HasMaxLength(150);
            e.Property(x => x.Mobile).HasMaxLength(20);
            e.Property(x => x.Location).HasMaxLength(200);
            e.Property(x => x.Role).IsRequired().HasMaxLength(50);
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.CreatedOn).IsRequired();
            e.Property(x => x.UpdatedOn).IsRequired();
            e.Property(x => x.ModifiedBy).HasMaxLength(100);

            // Unique index on Username
            e.HasIndex(x => x.Username).IsUnique();

            // Employee → Department (many-to-one)
            // Restrict delete so we cannot delete a department that still has employees
            e.HasOne(x => x.Department)
             .WithMany(d => d.Employees)
             .HasForeignKey(x => x.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Department ────────────────────────────────────────────────────────
        modelBuilder.Entity<Department>(d =>
        {
            d.ToTable("Jan_Dept_Mast");
            d.HasKey(x => x.DepartmentId);

            d.Property(x => x.DepartmentId).ValueGeneratedOnAdd();
            d.Property(x => x.DepartmentName).IsRequired().HasMaxLength(100);
            d.Property(x => x.CreatedOn).IsRequired();
            d.Property(x => x.UpdatedOn).IsRequired();
            d.Property(x => x.ModifiedBy).HasMaxLength(100);

            // Department → HOD (Employee who heads the department)
            // Cascade delete is not set so HODs can be reassigned
            d.HasOne(x => x.Hod)
             .WithMany()
             .HasForeignKey(x => x.HodId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── Access Request ────────────────────────────────────────────────────
        modelBuilder.Entity<AccessRequestEntity>(ar =>
        {
            ar.ToTable("Jan_AccessRequest");
            ar.HasKey(x => x.AccessReqId);
            ar.Property(x => x.AccessReqId).ValueGeneratedOnAdd();
            ar.Property(x => x.CreatedOn).IsRequired();
            ar.Property(x => x.CreatedBy).HasMaxLength(100);
            ar.Property(x => x.ModifiedBy).HasMaxLength(100);

            // AccessRequest → AccessItem (one-to-many)
            ar.HasMany(x => x.AccessItems)
             .WithOne()
             .HasForeignKey(ai => ai.AccessReqId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Access Item ───────────────────────────────────────────────────────
        modelBuilder.Entity<AccessItemEntity>(ai =>
        {
            ai.HasKey(x => x.AccessItemId);
            ai.Property(x => x.AccessItemId).ValueGeneratedOnAdd();
            ai.Property(x => x.FolderPath).IsRequired().HasMaxLength(500);
            ai.Property(x => x.Reason).IsRequired().HasMaxLength(1000);
            ai.Property(x => x.CreatedOn).IsRequired();
            ai.Property(x => x.CreatedBy).HasMaxLength(100);
            ai.Property(x => x.ModifiedBy).HasMaxLength(100);
        });

        // ── Access Approval ───────────────────────────────────────────────────
        modelBuilder.Entity<AccessApprovalEntity>(aa =>
        {
            aa.HasKey(x => x.AccessApproveId);
            aa.Property(x => x.AccessApproveId).ValueGeneratedOnAdd();
            aa.Property(x => x.Comments).HasMaxLength(1000);
            aa.Property(x => x.CreatedOn).IsRequired();
            aa.Property(x => x.CreatedBy).HasMaxLength(100);
            aa.Property(x => x.ModifiedBy).HasMaxLength(100);

            // Foreign keys (no navigation properties needed)
            aa.HasIndex(x => x.AccessReqId);
            aa.HasIndex(x => x.AccessItemId);
        });

        // ── Access Audit ──────────────────────────────────────────────────────
        modelBuilder.Entity<AccessReqAuditEntity>(audit =>
        {
            audit.HasKey(x => x.AuditId);
            audit.Property(x => x.AuditId).ValueGeneratedOnAdd();
            audit.Property(x => x.EventType).IsRequired().HasMaxLength(100);
            audit.Property(x => x.Message).HasMaxLength(2000);
            audit.Property(x => x.RecipientEmpId).IsRequired();
            audit.Property(x => x.RecipientName).HasMaxLength(200);
            audit.Property(x => x.RecipientRole).HasMaxLength(100);
            audit.Property(x => x.IsRead).HasDefaultValue(false);
            audit.Property(x => x.CreatedOn).IsRequired();
            audit.Property(x => x.CreatedBy).HasMaxLength(100);
            audit.Property(x => x.ModifiedBy).HasMaxLength(100);

            // Foreign keys (no navigation properties needed)
            audit.HasIndex(x => x.AccessReqId);
            audit.HasIndex(x => x.AccessItemId);
            audit.HasIndex(x => x.AccessApproveId);
        });
    }
}
