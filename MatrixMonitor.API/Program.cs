using MatrixMonitor.API.Interface;
using MatrixMonitor.API.Service;
using MatrixMonitor.API.Utils;
using MatrixMonitor.Core.Database;
using MatrixMonitor.Core.Interface;
using MatrixMonitor.Core.Repository;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// builder.Services.AddResponseCaching();
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("RedisConnection");
    options.InstanceName = "MatrixMonitor_";
});

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

builder.Services.AddScoped<ILiveAttackRepository, LiveAttackRepository>();
builder.Services.AddScoped<ILiveAttackService, LiveAttackService>();
builder.Services.AddScoped<IHistoricalAttacksRepository, HistoricalAttacksRepository>();
builder.Services.AddScoped<IHistoricalService, HistoricalService>();

builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Matrix Monitor API v1");
    });
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("CorsPolicy");
// app.UseResponseCaching();
app.MapControllers();

app.Run();
