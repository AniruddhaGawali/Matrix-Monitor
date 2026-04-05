using MatrixMonitor.API.Interface;
using MatrixMonitor.API.Utils;
using MatrixMonitor.Core.Database;
using MatrixMonitor.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<MatrixMonitorPrimaryDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Main"),
        npgsqlOptions =>
        {
            npgsqlOptions.MigrationsAssembly("MatrixMonitor.Core");
        }));


builder.Services.AddSingleton<IReplicaConnectionProvider, ReplicaConnectionProvider>();

builder.Services.AddDbContext<MatrixMonitorReadOnlyDbContext>((sp, opt) =>
{
    var provider = sp.GetRequiredService<IReplicaConnectionProvider>();
    opt.UseNpgsql(provider.GetConnectionString());
    opt.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
});


builder.Services.AddInfrastructureService(builder.Configuration);

var host = builder.Build();
host.Run();
