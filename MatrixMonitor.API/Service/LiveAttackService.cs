using System.Text.Json;
using MatrixMonitor.API.Interface;
using MatrixMonitor.Core.Interface;
using MatrixMonitor.Core.Model;
using Microsoft.Extensions.Caching.Distributed;

namespace MatrixMonitor.API.Service;

public class LiveAttackService : ILiveAttackService
{
    private readonly ILiveAttackRepository _liveAttackRepository;
    private readonly IDistributedCache _cache;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };
    private static readonly DistributedCacheEntryOptions _cacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
    };


    public LiveAttackService(ILiveAttackRepository liveAttackRepository, IDistributedCache cache)
    {
        _liveAttackRepository = liveAttackRepository;
        _cache = cache;
    }
    public async Task<IEnumerable<LiveAttack>> GetThreatEvents(CancellationToken ct, int batchSize, int pageNumber)
    {
        var cacheKey = $"live_attacks_{batchSize}_{pageNumber}";

        var cachedData = await _cache.GetStringAsync(cacheKey, ct);
        if (!string.IsNullOrEmpty(cachedData))
        {
            var cachedResult = JsonSerializer.Deserialize<List<LiveAttack>>(cachedData, _jsonOptions);
            if (cachedResult != null)
                return cachedResult;
        }

        var result = await _liveAttackRepository.GetAllLiveAttacks(batchSize, pageNumber, ct);

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result, _jsonOptions), _cacheOptions, ct);
        return result;
    }
}
