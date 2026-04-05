using System;
using System.Runtime.CompilerServices;
using MatrixMonitor.Core.Model;

namespace MatrixMonitor.API.Interface;

public interface ILiveAttackService
{
    Task<IEnumerable<LiveAttack>> GetThreatEvents(CancellationToken ct, int batchSize, int pageNumber);

}
