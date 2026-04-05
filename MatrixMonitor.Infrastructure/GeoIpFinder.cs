using System;
using MatrixMonitor.Infrastructure.Interface;
using MaxMind.GeoIP2;
using MaxMind.GeoIP2.Model;
using MaxMind.GeoIP2.Responses;

namespace MatrixMonitor.Infrastructure;

public class GeoIpFinder : IGeoIpFinder
{
    private IGeoIP2DatabaseReader _ipDbReader;

    public GeoIpFinder(IGeoIP2DatabaseReader ipDbReader)
    {
        _ipDbReader = ipDbReader;
    }

    public CityResponse GetCityByIp(string ip)
    {
        return _ipDbReader.City(ip);
    }

    public Location GetLonAndLatByIp(string ip)
    {
        return GetCityByIp(ip).Location;
    }
}
