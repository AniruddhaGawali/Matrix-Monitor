using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MatrixMonitor.Core.Migrations
{
    /// <inheritdoc />
    public partial class UpdateColumnAddingVictims : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "victim_country_code",
                table: "LiveAttacks",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "victim_country_code",
                table: "HistoricalAttacks",
                type: "text[]",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "victim_country_code",
                table: "LiveAttacks");

            migrationBuilder.DropColumn(
                name: "victim_country_code",
                table: "HistoricalAttacks");
        }
    }
}
