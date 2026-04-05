
using MatrixMonitor.Core.Model;

namespace MatrixMonitor.Core.Interface;

public interface IHistoricalAttacksRepository
{
    Task<IEnumerable<HistoricalAttacks>> GetAllHistoricalAttacks(int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<IEnumerable<HistoricalAttacks>> GetHistoricalAttacksByIp(string ipAddress, CancellationToken cancellationToken);
    Task<IEnumerable<HistoricalAttacks>> GetHistoricalAttacksByDateRange(DateTime startDate, DateTime endDate, CancellationToken cancellationToken);
    Task<(DateTime minDate, DateTime maxDate)> GetMinMaxHistoricalDate(CancellationToken ct);
    Task AddHistoricalAttack(HistoricalAttacks attack, CancellationToken cancellationToken);
    Task AddListHistoricalAttacks(List<HistoricalAttacks> attacks, CancellationToken cancellationToken);
    Task AddListLiveAttacksToHistoricalAttacks(IEnumerable<LiveAttack> liveAttacks, CancellationToken cancellationToken);
    Task SaveAsync(CancellationToken cancellationToken);
    void UndoingChanges();

}
