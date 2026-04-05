public class AbuseIpDbApiResponse
{
    public List<AbuseIpDbRecord> Data { get; set; } = new();
}
public class AbuseIpDbApiReportResponse
{
    public AbuseIpDbReportsData Data { get; set; } = new();
}

public class AbuseIpDbRecord
{
    public string IpAddress { get; set; } = string.Empty;
    public int AbuseConfidenceScore { get; set; }
    public string CountryCode { get; set; } = string.Empty;
    public DateTime LastReportedAt { get; set; }
}

public class AbuseIpReport
{
    public string ReportedAt { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public List<int> Categories { get; set; } = new();
    public int ReporterId { get; set; }
    public string ReporterCountryCode { get; set; } = string.Empty;
    public string ReporterCountryName { get; set; } = string.Empty;
}

public class AbuseIpDbReportsData
{
    public int Total { get; set; }
    public int Page { get; set; }
    public int Count { get; set; }
    public int PerPage { get; set; }
    public int LastPage { get; set; }
    public string NextPageUrl { get; set; } = string.Empty;
    public string PreviousPageUrl { get; set; } = string.Empty;
    public List<AbuseIpReport> Results { get; set; } = new();
}
