using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingFulfillmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AffectedAccountId",
                table: "bookings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AffectedDeviceId",
                table: "bookings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeliveredAt",
                table: "bookings",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryStatus",
                table: "bookings",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DesiredOutcome",
                table: "bookings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AffectedAccountId",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "AffectedDeviceId",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "DeliveredAt",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "DeliveryStatus",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "DesiredOutcome",
                table: "bookings");
        }
    }
}
