using System;
using MaxMind.GeoIP2.Model;
using MaxMind.GeoIP2.Responses;

namespace MatrixMonitor.Infrastructure.Interface;



public interface IGeoIpFinder
{

    public CityResponse GetCityByIp(string ip);
    public Location GetLonAndLatByIp(string ip);
}
