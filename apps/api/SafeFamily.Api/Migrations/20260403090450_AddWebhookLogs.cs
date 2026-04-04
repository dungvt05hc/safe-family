using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWebhookLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "webhook_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    GatewayOrderId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    EventType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    GatewayTransactionId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Processed = table.Column<bool>(type: "boolean", nullable: false),
                    ProcessingNote = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    RawBody = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_webhook_logs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_webhook_logs_created_at",
                table: "webhook_logs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_webhook_logs_gateway_order_id",
                table: "webhook_logs",
                column: "GatewayOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_webhook_logs_provider_order_event",
                table: "webhook_logs",
                columns: new[] { "Provider", "GatewayOrderId", "EventType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "webhook_logs");
        }
    }
}
