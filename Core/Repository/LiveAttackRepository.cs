using System;
using MatrixMonitor.Core.Database;    // use the local DbContext namespace
using MatrixMonitor.Core.Interface;
using MatrixMonitor.Core.Model;
using Microsoft.EntityFrameworkCore;

namespace MatrixMonitor.Core.Repository;

public class LiveAttackRepository : ILiveAttackRepository
{
    private MatrixMonitorPrimaryDbContext _dbContext;
    private MatrixMonitorReadOnlyDbContext _readOnlyDbContext;

    public LiveAttackRepository(MatrixMonitorPrimaryDbContext dbContext, MatrixMonitorReadOnlyDbContext readOnlyDbContext)
    {
        _dbContext = dbContext;
        _readOnlyDbContext = readOnlyDbContext;
    }

    public async Task AddListLiveAttacks(List<LiveAttack> liveAttack, CancellationToken cancellationToken)
    {
        await _dbContext.AddRangeAsync(liveAttack, cancellationToken);
    }

    public Task AddLiveAttacks(LiveAttack liveAttack, CancellationToken cancellationToken)
    {
        _dbContext.AddAsync(liveAttack, cancellationToken);
        return Task.CompletedTask;
    }

    public async Task ClearLiveAttackDb(CancellationToken cancellationToken)
    {
        var sqlQuery = $"TRUNCATE TABLE \"LiveAttacks\"";
        await _dbContext.Database.ExecuteSqlRawAsync(sqlQuery, cancellationToken);
    }

    public async Task<IEnumerable<LiveAttack>> GetAllLiveAttacks(CancellationToken cancellationToken)
    {
        return await _readOnlyDbContext.LiveAttacks.ToListAsync(cancellationToken);
    }
    public async Task<IEnumerable<LiveAttack>> GetAllLiveAttacks(int size, int page, CancellationToken cancellationToken)
    {
        var query = _readOnlyDbContext.LiveAttacks.AsQueryable();

        if (size > 0 && page > 0)
        {
            query = query.Skip((page - 1) * size).Take(size);
        }
        else
        {
            return new List<LiveAttack>();
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<List<LiveAttack>> GetAllTopLiveAttacks(int limit, CancellationToken cancellationToken)
    {
        return await _readOnlyDbContext.LiveAttacks
            .OrderByDescending(i => i.ConfidenceScore)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<LiveAttack>> GetAllTopLiveAttacksHaveCategories(int limit, CancellationToken cancellationToken)
    {
        return await _readOnlyDbContext.LiveAttacks
            .OrderByDescending(i => i.ConfidenceScore)
            .Where(i => i.AttackCategories != null && i.AttackCategories.Any() && i.VictimCountryCode != null && i.VictimCountryCode.Any())
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public Task UpdateListLiveAttacks(List<LiveAttack> liveAttacks, CancellationToken cancellationToken)
    {
        foreach (var liveAttack in liveAttacks)
        {
            var existingEntry = _dbContext.ChangeTracker.Entries<LiveAttack>()
                .FirstOrDefault(e => e.Entity.Id == liveAttack.Id);

            if (existingEntry != null)
            {
                existingEntry.CurrentValues.SetValues(liveAttack);
                existingEntry.State = EntityState.Modified;
            }
            else
            {
                _dbContext.LiveAttacks.Update(liveAttack);
            }
        }

        return Task.CompletedTask;
    }

    public Task UpdateLiveAttack(LiveAttack liveAttack, CancellationToken cancellationToken)
    {
        var existingEntry = _dbContext.ChangeTracker.Entries<LiveAttack>()
            .FirstOrDefault(e => e.Entity.Id == liveAttack.Id);

        if (existingEntry != null)
        {
            existingEntry.CurrentValues.SetValues(liveAttack);
            existingEntry.State = EntityState.Modified;
        }
        else
        {
            _dbContext.LiveAttacks.Update(liveAttack);
        }

        return Task.CompletedTask;
    }
    public void ClearChangeTracker()
    {
        _dbContext.ChangeTracker.Clear();
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
