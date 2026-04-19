using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorPackagesToDigitalProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "Description", "DurationLabel", "DurationMinutes" },
                values: new object[] { "Instantly understand where your family stands on digital safety. Receive a downloadable security summary report highlighting your top gaps and 3 personalised action items — no card required.", "Instant access", 0 });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "Description", "DurationLabel", "DurationMinutes", "Name", "PriceDisplay" },
                values: new object[] { "A comprehensive, personalised PDF safety plan covering every account, device, and family member. Includes a full security audit, a premium interactive checklist, and step-by-step improvement guidance.", "Ready within 24h", 0, "Family Safety Plan", "2,000 VND" });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Description", "DurationLabel", "DurationMinutes", "Name", "PriceDisplay" },
                values: new object[] { "Dealing with a breach, scam, or data leak? Get an expert-authored recovery pack with step-by-step containment actions, a threat checklist, and a follow-up monitoring guide — delivered fast.", "Priority — within 12h", 0, "Incident Recovery Pack", "149,000 VND" });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Description", "DurationLabel", "DurationMinutes" },
                values: new object[] { "Year-round digital protection delivered to your account. Includes 4 quarterly safety plan updates, priority incident response with a 24-hour SLA, and a personalised full-family security roadmap.", "12 months access", 365 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "Description", "DurationLabel", "DurationMinutes" },
                values: new object[] { "A complimentary 30-minute session to review your family's current digital safety posture and identify quick wins.", "30 min", 30 });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "Description", "DurationLabel", "DurationMinutes", "Name", "PriceDisplay" },
                values: new object[] { "An in-depth 60-minute consultation covering password hygiene, device security, phishing awareness, and safe browsing for all family members.", "60 min", 60, "Family Safety Session", "2,000 VND / session" });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Description", "DurationLabel", "DurationMinutes", "Name", "PriceDisplay" },
                values: new object[] { "A 90-minute guided incident response session to contain and remediate an active security incident affecting your family.", "90 min", 90, "Incident Response", "149,000 VND / session" });

            migrationBuilder.UpdateData(
                table: "service_packages",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Description", "DurationLabel", "DurationMinutes" },
                values: new object[] { "Year-round protection planning: quarterly check-ins, priority incident response, and a personalised family security roadmap.", "Ongoing", 720 });
        }
    }
}
