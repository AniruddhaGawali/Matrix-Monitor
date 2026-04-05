using MatrixMonitor.API.Interface;
using Microsoft.AspNetCore.Mvc;


namespace MatrixMonitor.API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttacksController : ControllerBase
    {

        private readonly ILiveAttackService _liveAttackService;
        private readonly IHistoricalService _historicalService;

        public AttacksController(ILiveAttackService liveAttackService, IHistoricalService historicalService)
        {
            _liveAttackService = liveAttackService;
            _historicalService = historicalService;
        }

        [HttpGet]
        [ResponseCache(Duration = 600, Location = ResponseCacheLocation.Any, NoStore = false)]
        public async Task<IResult> GetLiveAttacks(CancellationToken ct, [FromQuery] int? limit, [FromQuery] int? page)
        {
            var result = await _liveAttackService.GetThreatEvents(ct, limit ?? 100, page ?? 1);
            return Results.Ok(result);
        }

        [HttpGet("historical-data")]
        [ResponseCache(Duration = 600, Location = ResponseCacheLocation.Any, NoStore = false)]
        public async Task<IResult> GetHistoricalAttacks(CancellationToken ct, [FromQuery] DateTime? dateTime)
        {
            return Results.Ok(await _historicalService.GetHistoricalAttacks(ct, dateTime ?? DateTime.Now));
        }

        [HttpGet("min-max-date")]
        [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any, NoStore = false)]
        public async Task<IResult> GetMinMaxHistoricalDate(CancellationToken ct)
        {
            var ianaId = Request.Headers["X-TimeZone-Id"].ToString();

            if (string.IsNullOrEmpty(ianaId))
            {
                return Results.BadRequest("Missing X-TimeZone-Id header.");
            }

            TimeZoneInfo userTimeZone;
            try
            {
                userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(ianaId);
            }
            catch (TimeZoneNotFoundException)
            {
                return Results.BadRequest("Invalid X-TimeZone-Id header: time zone not found.");
            }
            catch (InvalidTimeZoneException)
            {
                return Results.BadRequest("Invalid X-TimeZone-Id header: time zone data is corrupt or invalid.");
            }

            var result = await _historicalService.GetMinMaxHistoricalDate(ct, userTimeZone);

            return Results.Ok(new
            {
                result.minDate,
                result.maxDate
            });

        }
    }
}
