using System;
using MatrixMonitor.API.Interface;
using Microsoft.Extensions.Configuration;

namespace MatrixMonitor.API.Utils;

public class ReplicaConnectionProvider : IReplicaConnectionProvider
{
    private readonly string[] _conns;
    public ReplicaConnectionProvider(IConfiguration config)
    {
        var connStrings = new[] { config.GetConnectionString("Replica1"), config.GetConnectionString("Replica2") };

        if (connStrings.Any(c => c == null))
        {
            throw new Exception("Replica connection strings are not properly configured.");
        }

        _conns = connStrings!;
    }
    public string GetConnectionString() => _conns[Random.Shared.Next(_conns.Length)];
}
