using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSafetyTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Guidance",
                table: "checklist_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPremium",
                table: "checklist_items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Phase",
                table: "checklist_items",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "RegenerationRequested",
                table: "checklist_items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "SourceBookingId",
                table: "checklist_items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TargetId",
                table: "checklist_items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TargetLabel",
                table: "checklist_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TargetType",
                table: "checklist_items",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "safety_tasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SourceId = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    TargetType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TargetId = table.Column<Guid>(type: "uuid", nullable: true),
                    TargetLabel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    WhyThisMatters = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    GuidanceMarkdown = table.Column<string>(type: "text", nullable: true),
                    HelpLink = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Priority = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Phase = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    DueAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    IsPremium = table.Column<bool>(type: "boolean", nullable: false),
                    IsGenerated = table.Column<bool>(type: "boolean", nullable: false),
                    GenerationKey = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    SupersededByTaskId = table.Column<Guid>(type: "uuid", nullable: true),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    SkippedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_safety_tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_safety_tasks_families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_safety_tasks_safety_tasks_SupersededByTaskId",
                        column: x => x.SupersededByTaskId,
                        principalTable: "safety_tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "task_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    OldStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    NewStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_task_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_task_events_safety_tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "safety_tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_safety_tasks_family_generation_key",
                table: "safety_tasks",
                columns: new[] { "FamilyId", "GenerationKey" },
                unique: true,
                filter: "\"GenerationKey\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_safety_tasks_family_id",
                table: "safety_tasks",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "ix_safety_tasks_family_phase",
                table: "safety_tasks",
                columns: new[] { "FamilyId", "Phase" });

            migrationBuilder.CreateIndex(
                name: "ix_safety_tasks_family_priority",
                table: "safety_tasks",
                columns: new[] { "FamilyId", "Priority" });

            migrationBuilder.CreateIndex(
                name: "ix_safety_tasks_family_source_id",
                table: "safety_tasks",
                columns: new[] { "FamilyId", "SourceId" },
                filter: "\"SourceId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_safety_tasks_family_source_type",
                table: "safety_tasks",
                columns: new[] { "FamilyId", "SourceType" });

            migrationBuilder.CreateIndex(
                name: "ix_safety_tasks_family_status",
                table: "safety_tasks",
                columns: new[] { "FamilyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_safety_tasks_SupersededByTaskId",
                table: "safety_tasks",
                column: "SupersededByTaskId");

            migrationBuilder.CreateIndex(
                name: "ix_task_events_created_by_id",
                table: "task_events",
                column: "CreatedById",
                filter: "\"CreatedById\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_task_events_task_id",
                table: "task_events",
                column: "TaskId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "task_events");

            migrationBuilder.DropTable(
                name: "safety_tasks");

            migrationBuilder.DropColumn(
                name: "Guidance",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "IsPremium",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "Phase",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "RegenerationRequested",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "SourceBookingId",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "TargetId",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "TargetLabel",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "TargetType",
                table: "checklist_items");
        }
    }
}
