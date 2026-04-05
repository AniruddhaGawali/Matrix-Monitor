using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MatrixMonitor.Core.Model;

public class LiveAttack
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; init; }

    [Column("ip_address")]
    public string IPAddress { get; set; } = String.Empty;

    [Column("confidence_score")]
    public double ConfidenceScore { get; set; }

    [Column("attack_categories")]
    public List<AttackCategory> AttackCategories { get; set; } = new();

    [Column("latitude")]
    public double? Latitude { get; set; }

    [Column("longitude")]
    public double? Longitude { get; set; }

    [Column("victim_country_code")]
    public List<string>? VictimCountryCode { get; set; } = new();

    [Column("timestamp")]
    public DateTime TimeStamp { get; set; }
}
