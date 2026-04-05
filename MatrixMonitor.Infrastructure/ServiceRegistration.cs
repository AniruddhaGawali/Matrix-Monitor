using System;
using MatrixMonitor.Core.Interface;
using MatrixMonitor.Core.Repository;
using MatrixMonitor.Infrastructure.Interface;
using MaxMind.GeoIP2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MatrixMonitor.Infrastructure;

public static class ServiceRegistration
{
    public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration)
    {
        string abuseIpApiKey = configuration.GetValue<string>("MatrixMonitor:AbuseIPDBKey") ?? "";

        services.AddHttpClient("AbuseIPClient", client =>
        {
            client.BaseAddress = new Uri("https://api.abuseipdb.com/");
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("Key", abuseIpApiKey);
        });

        services.AddSingleton<IGeoIP2DatabaseReader, DatabaseReader>(c =>
        {
            string basePath = AppContext.BaseDirectory;
            string dbPath = Path.Combine(basePath, "Data", "GeoLite2-City.mmdb");

            if (!System.IO.File.Exists(dbPath))
            {
                throw new System.IO.FileNotFoundException(
                    $"MaxMind DB not found at: {dbPath}. Did you forget the .csproj CopyToOutputDirectory step?");
            }

            return new DatabaseReader(dbPath);
        });

        services.AddHostedService<AbuseIpBlacklistIngestionWorker>();
        // services.AddHostedService<HistoricalEnrichmentWorker>();

        services.AddScoped<IGeoIpFinder, GeoIpFinder>();
        services.AddTransient<ILiveAttackRepository, LiveAttackRepository>();
        services.AddScoped<IAbuseIPWorkerService, AbuseIpWorkerService>();
        services.AddScoped<IHistoricalAttacksRepository, HistoricalAttacksRepository>();

        return services;
    }

}
