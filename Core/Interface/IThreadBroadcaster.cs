using System;
using MatrixMonitor.Core.Model;

namespace MatrixMonitor.Core.Interface;


public interface IThreatBroadcaster
{
    public void Broadcast(ThreatEvent threatEvent);
    IAsyncEnumerable<ThreatEvent> SubscribeAsync(CancellationToken ct);
}
