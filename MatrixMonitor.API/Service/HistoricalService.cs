using System.Text.Json;
using MatrixMonitor.API.Interface;
using MatrixMonitor.Core.Interface;
using MatrixMonitor.Core.Model;
using Microsoft.Extensions.Caching.Distributed;

namespace MatrixMonitor.API.Service;

public class HistoricalService : IHistoricalService
{
    private sealed class MinMaxHistoricalDateCacheModel
    {
        public DateTime MinDate { get; set; }
        public DateTime MaxDate { get; set; }
    }

    private readonly IHistoricalAttacksRepository _historicalAttacksRepository;
    private readonly IDistributedCache _cache;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };
    private static readonly DistributedCacheEntryOptions _cacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
    };



    public HistoricalService(IHistoricalAttacksRepository historicalAttacksRepository, IDistributedCache cache)
    {
        _historicalAttacksRepository = historicalAttacksRepository;
        _cache = cache;
    }

    public async Task<IEnumerable<HistoricalAttacks>> GetHistoricalAttacks(CancellationToken ct, DateTime dateTime)
    {
        var cacheKey = $"historical_attacks_{dateTime:yyyyMMdd}";
        var cachedData = await _cache.GetStringAsync(cacheKey, ct);
        if (!string.IsNullOrEmpty(cachedData))
        {
            var cachedResult = JsonSerializer.Deserialize<List<HistoricalAttacks>>(cachedData, _jsonOptions);
            if (cachedResult != null) return cachedResult;
        }

        var startOfDay = dateTime.Date;
        var endOfDay = startOfDay.AddDays(1);
        var result = await _historicalAttacksRepository.GetHistoricalAttacksByDateRange(startOfDay, endOfDay, ct);

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result, _jsonOptions), _cacheOptions, ct);
        return result;
    }

    public async Task<(DateTime minDate, DateTime maxDate)> GetMinMaxHistoricalDate(CancellationToken ct, TimeZoneInfo timezone)
    {
        var cacheKey = $"historical_attacks_min_max_date_{timezone.Id}";
        var cachedData = await _cache.GetStringAsync(cacheKey, ct);
        if (!string.IsNullOrEmpty(cachedData))
        {
            var cachedResult = JsonSerializer.Deserialize<MinMaxHistoricalDateCacheModel>(cachedData, _jsonOptions);
            if (cachedResult != null)
            {
                return (cachedResult.MinDate, cachedResult.MaxDate);
            }
        }
        var result = await _historicalAttacksRepository.GetMinMaxHistoricalDate(ct);
        var minDate = TimeZoneInfo.ConvertTimeFromUtc(result.minDate, timezone);
        var maxDate = TimeZoneInfo.ConvertTimeFromUtc(result.maxDate, timezone);

        var finalResult = (minDate, maxDate);
        var cacheModel = new MinMaxHistoricalDateCacheModel
        {
            MinDate = minDate,
            MaxDate = maxDate
        };

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(cacheModel, _jsonOptions), _cacheOptions, ct);
        return finalResult;
    }
}
