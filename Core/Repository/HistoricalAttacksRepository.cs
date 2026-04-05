using System;
using MatrixMonitor.Core.Database;
using MatrixMonitor.Core.Interface;
using MatrixMonitor.Core.Model;
using Microsoft.EntityFrameworkCore;

namespace MatrixMonitor.Core.Repository;

public class HistoricalAttacksRepository : IHistoricalAttacksRepository
{
    private readonly MatrixMonitorPrimaryDbContext _dbContext;
    private readonly MatrixMonitorReadOnlyDbContext _readOnlyDbContext;
    public HistoricalAttacksRepository(MatrixMonitorPrimaryDbContext dbContext, MatrixMonitorReadOnlyDbContext secondaryDbContext)
    {
        _dbContext = dbContext;
        _readOnlyDbContext = secondaryDbContext;
    }
    public async Task AddHistoricalAttack(HistoricalAttacks attack, CancellationToken cancellationToken)
    {
        await _dbContext.HistoricalAttacks.AddAsync(attack, cancellationToken);
    }

    public async Task AddListHistoricalAttacks(List<HistoricalAttacks> attacks, CancellationToken cancellationToken)
    {
        await _dbContext.HistoricalAttacks.AddRangeAsync(attacks, cancellationToken);
    }

    public async Task AddListLiveAttacksToHistoricalAttacks(IEnumerable<LiveAttack> liveAttacks, CancellationToken cancellationToken)
    {
        await _dbContext.HistoricalAttacks.AddRangeAsync(liveAttacks.Select(la => new HistoricalAttacks
        {
            IPAddress = la.IPAddress,
            AttackCategories = la.AttackCategories,
            ConfidenceScore = la.ConfidenceScore,
            VictimCountryCode = la.VictimCountryCode,
            Latitude = la.Latitude,
            Longitude = la.Longitude,
            TimeStamp = la.TimeStamp
        }).ToList(), cancellationToken);
    }

    public async Task<IEnumerable<HistoricalAttacks>> GetAllHistoricalAttacks(int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        return await _readOnlyDbContext.HistoricalAttacks
            .OrderByDescending(ha => ha.TimeStamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<HistoricalAttacks>> GetHistoricalAttacksByDateRange(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {

        return await _readOnlyDbContext.HistoricalAttacks
            .Where(ha => ha.TimeStamp >= startDate && ha.TimeStamp <= endDate)
            .OrderByDescending(ha => ha.TimeStamp)
            .ToListAsync(cancellationToken);

    }

    public async Task<IEnumerable<HistoricalAttacks>> GetHistoricalAttacksByIp(string ipAddress, CancellationToken cancellationToken)
    {
        return await _readOnlyDbContext.HistoricalAttacks
            .Where(ha => ha.IPAddress == ipAddress)
            .OrderByDescending(ha => ha.TimeStamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<(DateTime minDate, DateTime maxDate)> GetMinMaxHistoricalDate(CancellationToken ct)
    {
        var minDate = await _readOnlyDbContext.HistoricalAttacks.MinAsync(item => item.TimeStamp, ct);
        var maxDate = await _readOnlyDbContext.LiveAttacks.MaxAsync(item => item.TimeStamp, ct);

        return (minDate, maxDate);
    }

    public async Task SaveAsync(CancellationToken cancellationToken)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public void UndoingChanges()
    {
        foreach (var entry in _dbContext.ChangeTracker.Entries())
        {
            switch (entry.State)
            {
                case EntityState.Modified:
                    entry.State = EntityState.Unchanged;
                    break;
                case EntityState.Added:
                    entry.State = EntityState.Detached;
                    break;
                case EntityState.Deleted:
                    entry.Reload();
                    break;
                default:
                    break;
            }
        }
    }
}
