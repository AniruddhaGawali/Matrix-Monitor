using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MatrixMonitor.Core.Migrations
{
    /// <inheritdoc />
    public partial class addedRowInLiveAttack : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int[]>(
                name: "attack_categories",
                table: "LiveAttacks",
                type: "integer[]",
                nullable: false,
                defaultValue: new int[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "attack_categories",
                table: "LiveAttacks");
        }
    }
}
