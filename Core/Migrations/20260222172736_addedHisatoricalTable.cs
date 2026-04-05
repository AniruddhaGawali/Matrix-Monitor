using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MatrixMonitor.Core.Migrations
{
    /// <inheritdoc />
    public partial class addedHisatoricalTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "threat_type",
                table: "LiveAttacks");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:attack_catergory", "dns_compromise,dns_poisoning,fraud_orders,d_do_s_attack,ftp_brute_force,ping_of_death,phishing,fraud_vo_ip,open_proxy,web_spam,email_spam,blog_spam,vpn_ip,port_scan,hacking,sql_injection,spoofing,brute_force,bad_web_bot,exploited_host,web_app_attack,ssh,io_t_targeted");

            migrationBuilder.CreateTable(
                name: "HistoricalAttacks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    ip_address = table.Column<string>(type: "text", nullable: false),
                    attack_categories = table.Column<int[]>(type: "integer[]", nullable: false),
                    confidence_score = table.Column<double>(type: "double precision", nullable: false),
                    latitude = table.Column<double>(type: "double precision", nullable: true),
                    longitude = table.Column<double>(type: "double precision", nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricalAttacks", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistoricalAttacks");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:Enum:attack_catergory", "dns_compromise,dns_poisoning,fraud_orders,d_do_s_attack,ftp_brute_force,ping_of_death,phishing,fraud_vo_ip,open_proxy,web_spam,email_spam,blog_spam,vpn_ip,port_scan,hacking,sql_injection,spoofing,brute_force,bad_web_bot,exploited_host,web_app_attack,ssh,io_t_targeted");

            migrationBuilder.AddColumn<string>(
                name: "threat_type",
                table: "LiveAttacks",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
