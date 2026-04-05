using System;

namespace MatrixMonitor.Core.Model;

public class ThreatEvent
{
    public string IPAddress { get; set; } = String.Empty;
    public double ConfidenceScore { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime TimeStamp { get; set; }
    public List<AttackCategory> AttackCategories { get; set; } = new();

    public ThreatEvent(string ip, double confidenceScore, double? latitude, double? longitude, DateTime timeStamp, List<AttackCategory> attackCategories)
    {
        IPAddress = ip;
        ConfidenceScore = confidenceScore;
        Latitude = latitude;
        Longitude = longitude;
        TimeStamp = timeStamp;
        AttackCategories = attackCategories;
    }
}
