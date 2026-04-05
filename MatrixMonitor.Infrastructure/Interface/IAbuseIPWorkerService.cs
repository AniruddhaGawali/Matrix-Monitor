using System;
using Microsoft.EntityFrameworkCore;

namespace MatrixMonitor.Infrastructure.Interface;

public interface IAbuseIPWorkerService
{

    Task MoveCurrentTopAttacksToHistorical(int limit, CancellationToken cancellationToken);
    Task ClearCurrentAttacksDb(CancellationToken cancellationToken);
    Task FetchNewAttacks(CancellationToken cancellationToken);
    Task FetchRecordsOfTopAttacks(int limit, int delayForNextRequest, CancellationToken cancellationToken);

}
