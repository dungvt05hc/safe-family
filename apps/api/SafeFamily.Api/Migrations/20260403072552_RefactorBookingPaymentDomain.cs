using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorBookingPaymentDomain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Step 1: Remap old enum string values on existing columns ──────────
            // BookingStatus: old "Pending" → new "Submitted"
            migrationBuilder.Sql(@"UPDATE bookings SET ""Status"" = 'Submitted' WHERE ""Status"" = 'Pending';");
            // PaymentStatus: old "Waived" → new "Unpaid" (no equivalent in new model)
            migrationBuilder.Sql(@"UPDATE bookings SET ""PaymentStatus"" = 'Unpaid' WHERE ""PaymentStatus"" = 'Waived';");

            // ── Step 2: Schema changes ────────────────────────────────────────────
            migrationBuilder.AlterColumn<string>(
                name: "PaymentStatus",
                table: "bookings",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ExpiresAt",
                table: "bookings",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ScheduledEndAt",
                table: "bookings",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ScheduledStartAt",
                table: "bookings",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SnapshotCurrency",
                table: "bookings",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SnapshotDurationMinutes",
                table: "bookings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SnapshotPackageCode",
                table: "bookings",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SnapshotPackageName",
                table: "bookings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "SnapshotPrice",
                table: "bookings",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "bookings",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "SourceAssessmentId",
                table: "bookings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SourceIncidentId",
                table: "bookings",
                type: "uuid",
                nullable: true);

            // ── Step 3: Backfill snapshot columns for pre-existing bookings ────────
            migrationBuilder.Sql(@"
                UPDATE bookings b
                SET ""SnapshotPackageName""     = sp.""Name"",
                    ""SnapshotPackageCode""     = sp.""Code"",
                    ""SnapshotPrice""           = sp.""Price"",
                    ""SnapshotCurrency""        = sp.""Currency"",
                    ""SnapshotDurationMinutes"" = sp.""DurationMinutes"",
                    ""Source""                  = 'Direct'
                FROM service_packages sp
                WHERE b.""PackageId"" = sp.""Id""
                  AND b.""SnapshotPackageName"" = '';
            ");

            // ── Step 4: Create new tables ─────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "booking_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FromValue = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ToValue = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ActorId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActorEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_booking_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_booking_events_bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payment_orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    GatewayProvider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    GatewayOrderId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    GatewayTransactionId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    GatewayRawResponse = table.Column<string>(type: "jsonb", nullable: true),
                    PaidAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    FailedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    RefundedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    RefundedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment_orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_payment_orders_bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_booking_events_BookingId",
                table: "booking_events",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_payment_orders_BookingId",
                table: "payment_orders",
                column: "BookingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "booking_events");
            migrationBuilder.DropTable(name: "payment_orders");

            migrationBuilder.DropColumn(name: "ExpiresAt",              table: "bookings");
            migrationBuilder.DropColumn(name: "ScheduledEndAt",         table: "bookings");
            migrationBuilder.DropColumn(name: "ScheduledStartAt",       table: "bookings");
            migrationBuilder.DropColumn(name: "SnapshotCurrency",       table: "bookings");
            migrationBuilder.DropColumn(name: "SnapshotDurationMinutes",table: "bookings");
            migrationBuilder.DropColumn(name: "SnapshotPackageCode",    table: "bookings");
            migrationBuilder.DropColumn(name: "SnapshotPackageName",    table: "bookings");
            migrationBuilder.DropColumn(name: "SnapshotPrice",          table: "bookings");
            migrationBuilder.DropColumn(name: "Source",                 table: "bookings");
            migrationBuilder.DropColumn(name: "SourceAssessmentId",     table: "bookings");
            migrationBuilder.DropColumn(name: "SourceIncidentId",       table: "bookings");

            migrationBuilder.AlterColumn<string>(
                name: "PaymentStatus",
                table: "bookings",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);
        }
    }
}

