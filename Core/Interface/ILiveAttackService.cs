using System;
using MatrixMonitor.Core.Model;

namespace MatrixMonitor.Core.Interface;

public interface ILiveAttackRepository
{
    Task<IEnumerable<LiveAttack>> GetAllLiveAttacks(CancellationToken cancellationToken);
    Task<IEnumerable<LiveAttack>> GetAllLiveAttacks(int size, int page, CancellationToken cancellationToken);
    Task<List<LiveAttack>> GetAllTopLiveAttacks(int limit, CancellationToken cancellationToken);
    Task<List<LiveAttack>> GetAllTopLiveAttacksHaveCategories(int limit, CancellationToken cancellationToken);
    Task AddLiveAttacks(LiveAttack liveAttack, CancellationToken cancellationToken);
    Task AddListLiveAttacks(List<LiveAttack> liveAttack, CancellationToken cancellationToken);
    Task UpdateLiveAttack(LiveAttack liveAttack, CancellationToken cancellationToken);
    Task UpdateListLiveAttacks(List<LiveAttack> liveAttacks, CancellationToken cancellationToken);
    Task ClearLiveAttackDb(CancellationToken cancellationToken);
    Task SaveAsync(CancellationToken cancellationToken);
    void ClearChangeTracker();
    void UndoingChanges();

}
