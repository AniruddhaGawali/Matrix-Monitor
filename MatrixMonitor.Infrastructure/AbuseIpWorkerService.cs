using System;
using System.Net;
using System.Net.Http.Json;
using MatrixMonitor.Core.Interface;
using MatrixMonitor.Core.Model;
using MatrixMonitor.Infrastructure.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MatrixMonitor.Infrastructure;

public class AbuseIpWorkerService : IAbuseIPWorkerService
{
    private readonly ILogger<AbuseIpWorkerService> _logger;
    private readonly IGeoIpFinder _geoIpFinder;
    private readonly ILiveAttackRepository _liveAttackRepository;
    private readonly IHistoricalAttacksRepository _historicalAttacksRepository;
    private readonly IHttpClientFactory _httpClientFactory;

    public AbuseIpWorkerService(ILogger<AbuseIpWorkerService> logger, IGeoIpFinder geoIpFinder, ILiveAttackRepository liveAttackRepository, IHistoricalAttacksRepository historicalAttacksRepository, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _geoIpFinder = geoIpFinder;
        _liveAttackRepository = liveAttackRepository;
        _historicalAttacksRepository = historicalAttacksRepository;
        _httpClientFactory = httpClientFactory;
    }

    public async Task ClearCurrentAttacksDb(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting Clearing the current attacks db at ${time}", DateTimeOffset.UtcNow);
            await _liveAttackRepository.ClearLiveAttackDb(cancellationToken);
            _logger.LogInformation("Finished Clearing the current attacks db at ${time}", DateTimeOffset.UtcNow);
        }
        catch (System.Exception ex)
        {

            _logger.LogError(ex, "Error in Clearing the current attacks db at ${time}", DateTimeOffset.UtcNow);
            _liveAttackRepository.UndoingChanges();
        }
    }

    public async Task FetchNewAttacks(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting Fetching the New attacks at {time}", DateTimeOffset.UtcNow);

        try
        {
            var client = _httpClientFactory.CreateClient("AbuseIPClient");
            var resp = await client.GetAsync("api/v2/blacklist?confidenceMinimum=25&ipVersion=4", cancellationToken);
            var apiResult = await resp.Content.ReadFromJsonAsync<AbuseIpDbApiResponse>(cancellationToken);

            if (!resp.IsSuccessStatusCode || apiResult == null || apiResult.Data.Count == 0)
                return;

            const int batchSize = 500;
            var batch = new List<LiveAttack>(batchSize);

            foreach (var item in apiResult.Data)
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    var geoLocation = _geoIpFinder.GetLonAndLatByIp(item.IpAddress);
                    batch.Add(new LiveAttack
                    {
                        IPAddress = item.IpAddress,
                        Latitude = geoLocation.Latitude,
                        Longitude = geoLocation.Longitude,
                        ConfidenceScore = item.AbuseConfidenceScore,
                        TimeStamp = DateTime.SpecifyKind(item.LastReportedAt, DateTimeKind.Utc)
                    });
                }
                catch (MaxMind.GeoIP2.Exceptions.AddressNotFoundException)
                {
                    _logger.LogWarning("IP {IPAddress} not found in GeoIP database. Skipping.", item.IpAddress);
                    batch.Add(new LiveAttack
                    {
                        IPAddress = item.IpAddress,
                        Latitude = null,
                        Longitude = null,
                        ConfidenceScore = item.AbuseConfidenceScore,
                        TimeStamp = DateTime.SpecifyKind(item.LastReportedAt, DateTimeKind.Utc)
                    });
                }

                if (batch.Count >= batchSize)
                {
                    await _liveAttackRepository.AddListLiveAttacks(batch, cancellationToken);
                    await _liveAttackRepository.SaveAsync(cancellationToken);
                    batch.Clear();
                }
            }

            if (batch.Any())
            {
                await _liveAttackRepository.AddListLiveAttacks(batch, cancellationToken);
                await _liveAttackRepository.SaveAsync(cancellationToken);
            }

            _logger.LogInformation("Finished Fetching the New attacks {Count} and Saving to db at {time}", apiResult.Data.Count, DateTimeOffset.UtcNow);
            _liveAttackRepository.ClearChangeTracker();
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Error in Fetching the New attacks and Saving to db at {time}", DateTimeOffset.UtcNow);
            _liveAttackRepository.UndoingChanges();
        }
    }

    public async Task FetchRecordsOfTopAttacks(int limit, int delayForNextRequest, CancellationToken cancellationToken)
    {
        try
        {
            var topAttacksOfDay = await _liveAttackRepository.GetAllTopLiveAttacks(limit, cancellationToken);
            var actualCount = topAttacksOfDay?.Count ?? 0;

            _logger.LogInformation("Starting Fetching the Records for {Count} actual attacks and Saving to db at {Time}", actualCount, DateTimeOffset.UtcNow);

            var client = _httpClientFactory.CreateClient("AbuseIPClient");

            if (topAttacksOfDay == null || topAttacksOfDay.Count == 0)
            {
                return;
            }

            foreach (var item in topAttacksOfDay)
            {
                HttpResponseMessage? resp = null;
                var isSuccess = false;

                // Retry loop: Try up to 3 times ONLY for 500 Internal Server Error
                for (var attempt = 1; attempt <= 3; attempt++)
                {
                    resp = await client.GetAsync($"api/v2/reports?ipAddress={item.IPAddress}&maxAgeInDays=1", cancellationToken);

                    if (resp.IsSuccessStatusCode)
                    {
                        isSuccess = true;
                        break; // Success! Break out of the retry loop.
                    }

                    if (resp.StatusCode == HttpStatusCode.InternalServerError)
                    {
                        _logger.LogWarning("500 Internal Server Error for IP {IP} at {Time}. Attempt {Attempt} of 3.", item.IPAddress, DateTimeOffset.UtcNow, attempt);

                        if (attempt == 3)
                        {
                            _logger.LogError("Skipping IP {IP} after 3 failed attempts due to 500 Internal Server Error.", item.IPAddress);
                        }
                        // Loop will naturally continue to the next attempt
                    }
                    else
                    {
                        // Handle other errors (like 429 TooManyRequests) just as before
                        _logger.LogError("Error in Fetching the Records for IP {IP} at {Time}. Status: {StatusCode}", item.IPAddress, DateTimeOffset.UtcNow, resp.StatusCode);

                        if (resp.StatusCode == HttpStatusCode.TooManyRequests)
                        {
                            _logger.LogWarning("Rate limit hit while Fetching for IP {IP}. Waiting for {Delay} seconds before retrying.", item.IPAddress, delayForNextRequest);
                            await Task.Delay(TimeSpan.FromSeconds(delayForNextRequest), cancellationToken);
                        }

                        break; // Break out of the retry loop for non-500 errors so it can move to the next IP
                    }
                }

                // If it wasn't successful after the loop finishes, skip to the next IP in the top attacks list
                if (!isSuccess || resp == null)
                {
                    continue;
                }

                var apiResult = await resp.Content.ReadFromJsonAsync<AbuseIpDbApiReportResponse>(cancellationToken);

                if (apiResult == null || apiResult.Data.Results.Count == 0)
                {
                    continue;
                }

                List<AttackCategory> categories = [.. apiResult.Data.Results.SelectMany(r => r.Categories.ConvertAll(i => (AttackCategory)Enum.ToObject(typeof(AttackCategory), i))).Distinct()];
                List<string> victimCountryCodes = [.. apiResult.Data.Results.Select(r => r.ReporterCountryCode).Distinct()];

                item.AttackCategories = categories;
                item.VictimCountryCode = victimCountryCodes;

                await _liveAttackRepository.UpdateLiveAttack(item, cancellationToken);
                await _liveAttackRepository.SaveAsync(cancellationToken);

                await Task.Delay(TimeSpan.FromSeconds(delayForNextRequest), cancellationToken);
            }

            _logger.LogInformation("Finished Fetching and Saving Records for {Count} attacks at {Time}", actualCount, DateTimeOffset.UtcNow);

        }
        catch (System.Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Error in Fetching the Records of attacks and Saving to db at {Time}", DateTimeOffset.UtcNow);
            _liveAttackRepository.UndoingChanges();
        }
    }

    public async Task MoveCurrentTopAttacksToHistorical(int limit, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting Moving the Records of attacks {limit} from live to historical at ${time}", limit, DateTimeOffset.UtcNow);
        try
        {
            var topAttacks = await _liveAttackRepository.GetAllTopLiveAttacksHaveCategories(limit, cancellationToken);

            if (topAttacks != null && topAttacks.Count > 0)
            {
                await _historicalAttacksRepository.AddListLiveAttacksToHistoricalAttacks(topAttacks, cancellationToken);
                await _historicalAttacksRepository.SaveAsync(cancellationToken);

                _logger.LogInformation("Finished Moving the Records of attacks {Count} from live to historical at {time}", topAttacks.Count, DateTimeOffset.UtcNow);
            }

        }
        catch (System.Exception ex) when (ex is not OperationCanceledException)
        {

            _logger.LogError(ex, "Error in Moving the Records of attacks {limit} from live to historical at ${time}", limit, DateTimeOffset.UtcNow);
            _historicalAttacksRepository.UndoingChanges();
        }
    }
}
