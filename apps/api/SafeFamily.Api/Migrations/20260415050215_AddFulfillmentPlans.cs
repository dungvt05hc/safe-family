using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFulfillmentPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "family_safety_plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceAssessmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    AssessmentOverallScore = table.Column<int>(type: "integer", nullable: true),
                    AssessmentRiskLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    TopRisks = table.Column<string>(type: "text", nullable: false),
                    TopPriorities = table.Column<string>(type: "text", nullable: false),
                    ActionPlanByMember = table.Column<string>(type: "text", nullable: false),
                    ActionPlanByDevice = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_family_safety_plans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_family_safety_plans_families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "incident_recovery_packs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingId = table.Column<Guid>(type: "uuid", nullable: false),
                    LinkedIncidentId = table.Column<Guid>(type: "uuid", nullable: true),
                    WhatHappened = table.Column<string>(type: "text", nullable: false),
                    WhatToDoNow = table.Column<string>(type: "text", nullable: false),
                    WhatNotToDo = table.Column<string>(type: "text", nullable: false),
                    Next24Hours = table.Column<string>(type: "text", nullable: false),
                    Next7Days = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_incident_recovery_packs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_incident_recovery_packs_families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_family_safety_plans_BookingId",
                table: "family_safety_plans",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_family_safety_plans_FamilyId",
                table: "family_safety_plans",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_incident_recovery_packs_BookingId",
                table: "incident_recovery_packs",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_incident_recovery_packs_FamilyId",
                table: "incident_recovery_packs",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_incident_recovery_packs_LinkedIncidentId",
                table: "incident_recovery_packs",
                column: "LinkedIncidentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "family_safety_plans");

            migrationBuilder.DropTable(
                name: "incident_recovery_packs");
        }
    }
}
