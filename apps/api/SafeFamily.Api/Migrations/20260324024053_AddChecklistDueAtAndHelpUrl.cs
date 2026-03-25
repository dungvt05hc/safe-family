using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddChecklistDueAtAndHelpUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DueAt",
                table: "checklist_items",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HelpUrl",
                table: "checklist_items",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DueAt",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "HelpUrl",
                table: "checklist_items");
        }
    }
}
