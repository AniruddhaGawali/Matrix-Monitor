using MatrixMonitor.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MatrixMonitor.Infrastructure;

public class AbuseIpBlacklistIngestionWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AbuseIpBlacklistIngestionWorker> _logger;
    private readonly IConfiguration _configuration;
    private CancellationTokenSource? _internalCts;

    public AbuseIpBlacklistIngestionWorker(ILogger<AbuseIpBlacklistIngestionWorker> logger, IServiceScopeFactory scopeFactory, IConfiguration configuration)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Threat Ingest Monitor Worker started.");
        var recordFetchLimit = _configuration.GetValue<int?>("MatrixMonitor:RecordFetchLimit") ?? 0;
        var nextRunTimeHours = _configuration.GetValue<int?>("MatrixMonitor:NextRunTime") ?? 24;
        var delayForNextRequestInSecond = _configuration.GetValue<int?>("MatrixMonitor:DelayForNextRequest") ?? 120;

        Console.WriteLine($"Record Fetch Limit: {recordFetchLimit}");
        Console.WriteLine($"Next Run Time (Hours): {nextRunTimeHours}");
        Console.WriteLine($"Delay For Next Request (Seconds): {delayForNextRequestInSecond}");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            var nextRunTime = now.Date.AddHours(nextRunTimeHours);
            var delay = nextRunTime - now;

            _logger.LogInformation("Next ingestion scheduled for {time}. Waiting for {delay}...", nextRunTime, delay);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return;
            }

            if (_internalCts != null)
            {
                await _internalCts.CancelAsync();
                _internalCts.Dispose();
                _internalCts = null;
            }

            _internalCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);

            _logger.LogInformation("Starting the Ingestion of new attacks at {time}", DateTimeOffset.UtcNow);
            _logger.LogInformation("Estimated time for completion of ingestion: {time}", DateTimeOffset.UtcNow.AddSeconds(delayForNextRequestInSecond * (recordFetchLimit + 5)));

            try
            {
                using var scope = _scopeFactory.CreateScope();

                var abuseWorkerService = scope.ServiceProvider.GetRequiredService<IAbuseIPWorkerService>();

                await abuseWorkerService.ClearCurrentAttacksDb(_internalCts.Token);
                await abuseWorkerService.FetchNewAttacks(_internalCts.Token);
                await abuseWorkerService.FetchRecordsOfTopAttacks(recordFetchLimit, delayForNextRequestInSecond, _internalCts.Token);
                await abuseWorkerService.MoveCurrentTopAttacksToHistorical(recordFetchLimit, _internalCts.Token);

                _logger.LogInformation("Finished the Ingestion of new attacks at {time}", DateTimeOffset.UtcNow);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Error occurred during ingestion.");
            }
        }
    }

    public override void Dispose()
    {
        _internalCts?.Cancel();
        _internalCts?.Dispose();
        _internalCts = null;

        GC.SuppressFinalize(this);
        base.Dispose();
    }
}
