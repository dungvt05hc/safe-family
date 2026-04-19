using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateServicePackagePricesToVND : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "Currency",
                value: "VND");

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "Currency", "Price", "PriceDisplay" },
                values: new object[] { "VND", 99000m, "99,000 VND / session" });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Currency", "Price", "PriceDisplay" },
                values: new object[] { "VND", 149000m, "149,000 VND / session" });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Currency", "Price", "PriceDisplay" },
                values: new object[] { "VND", 299000m, "299,000 VND / year" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "Currency",
                value: "USD");

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "Currency", "Price", "PriceDisplay" },
                values: new object[] { "USD", 99m, "$99 / session" });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Currency", "Price", "PriceDisplay" },
                values: new object[] { "USD", 149m, "$149 / session" });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Currency", "Price", "PriceDisplay" },
                values: new object[] { "USD", 299m, "$299 / year" });
        }
    }
}
