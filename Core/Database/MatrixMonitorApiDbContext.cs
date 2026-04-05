using System;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MatrixMonitor.Core.Model;
using Microsoft.EntityFrameworkCore;

namespace MatrixMonitor.Core.Database;

public class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
{
    public UtcDateTimeConverter()
        : base(
            v => v.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(v, DateTimeKind.Utc)
                : v.Kind == DateTimeKind.Utc
                    ? v
                    : v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
    {
    }
}
public class MatrixMonitorBaseDbContext : DbContext
{
    public MatrixMonitorBaseDbContext(DbContextOptions options) : base(options)
    {

    }
    public DbSet<LiveAttack> LiveAttacks { get; set; }
    public DbSet<HistoricalAttacks> HistoricalAttacks { get; set; }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder
        .Properties<DateTime>()
        .HaveConversion<UtcDateTimeConverter>();
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LiveAttack>()
            .Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<HistoricalAttacks>()
            .Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.HasPostgresEnum<AttackCategory>(name: "attack_catergory");

    }
}


// Use this for INSERT, UPDATE, DELETE
public class MatrixMonitorPrimaryDbContext : MatrixMonitorBaseDbContext
{
    public MatrixMonitorPrimaryDbContext(DbContextOptions<MatrixMonitorPrimaryDbContext> options) : base(options) { }
}

// Use this for SELECT queries
public class MatrixMonitorReadOnlyDbContext : MatrixMonitorBaseDbContext
{
    public MatrixMonitorReadOnlyDbContext(DbContextOptions<MatrixMonitorReadOnlyDbContext> options) : base(options) { }
}
