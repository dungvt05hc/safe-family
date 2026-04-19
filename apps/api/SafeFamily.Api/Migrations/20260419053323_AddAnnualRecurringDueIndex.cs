using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAnnualRecurringDueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_safety_tasks_annual_recurring_due",
                table: "safety_tasks",
                columns: new[] { "SourceType", "Phase", "Status", "DueAt" },
                filter: "\"SupersededByTaskId\" IS NULL AND \"DueAt\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_safety_tasks_annual_recurring_due",
                table: "safety_tasks");
        }
    }
}
