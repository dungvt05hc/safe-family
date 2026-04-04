using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorBookingSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ScheduledStartAt",
                table: "bookings",
                newName: "ConfirmedStartAt");

            migrationBuilder.RenameColumn(
                name: "ScheduledEndAt",
                table: "bookings",
                newName: "ConfirmedEndAt");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "bookings",
                newName: "CustomerNotes");

            migrationBuilder.RenameColumn(
                name: "AssignedAdminId",
                table: "bookings",
                newName: "AssignedAdminUserId");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CompletedAt",
                table: "bookings",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InternalNotes",
                table: "bookings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "InternalNotes",
                table: "bookings");

            migrationBuilder.RenameColumn(
                name: "CustomerNotes",
                table: "bookings",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "ConfirmedStartAt",
                table: "bookings",
                newName: "ScheduledStartAt");

            migrationBuilder.RenameColumn(
                name: "ConfirmedEndAt",
                table: "bookings",
                newName: "ScheduledEndAt");

            migrationBuilder.RenameColumn(
                name: "AssignedAdminUserId",
                table: "bookings",
                newName: "AssignedAdminId");
        }
    }
}
