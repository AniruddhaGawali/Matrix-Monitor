using System;
using MatrixMonitor.Core.Model;

namespace MatrixMonitor.API.Interface;

public interface IHistoricalService
{
    Task<IEnumerable<HistoricalAttacks>> GetHistoricalAttacks(CancellationToken ct, DateTime dateTime);
    Task<(DateTime minDate, DateTime maxDate)> GetMinMaxHistoricalDate(CancellationToken ct, TimeZoneInfo timezone);

}
