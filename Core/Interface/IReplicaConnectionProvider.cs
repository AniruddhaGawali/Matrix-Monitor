using System;

namespace MatrixMonitor.API.Interface;

public interface IReplicaConnectionProvider
{
    string GetConnectionString();
}
