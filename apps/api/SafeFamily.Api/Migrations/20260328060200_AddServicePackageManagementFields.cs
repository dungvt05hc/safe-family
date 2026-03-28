using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddServicePackageManagementFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "service_packages",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "service_packages",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "USD");

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "service_packages",
                type: "integer",
                nullable: false,
                defaultValue: 60);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "service_packages",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVisible",
                table: "service_packages",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "service_packages",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql(@"
UPDATE service_packages
SET ""Code"" = CONCAT('PKG-', SUBSTRING(REPLACE(CAST(""Id"" AS text), '-', ''), 1, 8))
WHERE ""Code"" IS NULL OR ""Code"" = '';
");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "service_packages",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "Code", "Currency", "DurationMinutes", "IsActive", "IsVisible", "Price" },
                values: new object[] { "FREE-CHECK", "USD", 30, true, true, 0m });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "Code", "Currency", "DurationMinutes", "IsActive", "IsVisible", "Price" },
                values: new object[] { "FAMILY-CORE", "USD", 60, true, true, 99m });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Code", "Currency", "DurationMinutes", "IsActive", "IsVisible", "Price" },
                values: new object[] { "INCIDENT-RESP", "USD", 90, true, true, 149m });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Code", "Currency", "DurationMinutes", "IsActive", "IsVisible", "Price" },
                values: new object[] { "ANNUAL-PLAN", "USD", 720, true, true, 299m });

            migrationBuilder.CreateIndex(
                name: "IX_service_packages_Code",
                table: "service_packages",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_service_packages_Code",
                table: "service_packages");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "service_packages");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "service_packages");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "service_packages");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "service_packages");

            migrationBuilder.DropColumn(
                name: "IsVisible",
                table: "service_packages");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "service_packages");
        }
    }
}
