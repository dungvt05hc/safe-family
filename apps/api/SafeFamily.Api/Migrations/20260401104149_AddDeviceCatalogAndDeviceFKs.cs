using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SafeFamily.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDeviceCatalogAndDeviceFKs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "OsVersion",
                table: "devices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "OsName",
                table: "devices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Model",
                table: "devices",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "DeviceType",
                table: "devices",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Other",
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<string>(
                name: "Brand",
                table: "devices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<Guid>(
                name: "CatalogBrandId",
                table: "devices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CatalogDeviceTypeId",
                table: "devices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CatalogModelId",
                table: "devices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CatalogOsFamilyId",
                table: "devices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CatalogOsVersionId",
                table: "devices",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "device_catalog_brands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_catalog_brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "device_catalog_device_types",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_catalog_device_types", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "device_catalog_os_families",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_catalog_os_families", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "device_catalog_models",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BrandId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeviceTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultOsFamilyId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_catalog_models", x => x.Id);
                    table.ForeignKey(
                        name: "FK_device_catalog_models_device_catalog_brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "device_catalog_brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_device_catalog_models_device_catalog_device_types_DeviceTyp~",
                        column: x => x.DeviceTypeId,
                        principalTable: "device_catalog_device_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_device_catalog_models_device_catalog_os_families_DefaultOsF~",
                        column: x => x.DefaultOsFamilyId,
                        principalTable: "device_catalog_os_families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "device_catalog_os_versions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OsFamilyId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_catalog_os_versions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_device_catalog_os_versions_device_catalog_os_families_OsFam~",
                        column: x => x.OsFamilyId,
                        principalTable: "device_catalog_os_families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "device_catalog_brands",
                columns: new[] { "Id", "Code", "CreatedAt", "IsActive", "Name", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("01a92e92-73bb-ee44-a24a-bfd696d3632f"), "lenovo", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Lenovo", 7, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("324eb3d1-19fc-c047-9974-2811ce609513"), "hp", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "HP", 6, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "samsung", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Samsung", 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "apple", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Apple", 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("6888a3d6-fcd5-514b-8845-65fb0f090fce"), "asus", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Asus", 8, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("69bcbf05-d4f0-5848-9412-12ebf19ffab5"), "xiaomi", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Xiaomi", 10, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "google", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Google", 3, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a641753d-3b78-8848-9911-37e378174199"), "microsoft", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Microsoft", 4, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("b559d7a8-c7e1-9448-a725-38e4fbe83099"), "acer", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Acer", 9, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("e62cd2ba-d704-9a44-8f67-7396ddde96a9"), "dell", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Dell", 5, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "device_catalog_device_types",
                columns: new[] { "Id", "Code", "CreatedAt", "IsActive", "Name", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("31091e8b-4d96-9f45-8904-ebea99dbf7a7"), "desktop", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Desktop", 4, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), "smartphone", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Smartphone", 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), "tablet", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tablet", 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("ae5917a8-0449-5e4d-8565-278474ae7eec"), "other", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Other", 99, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("d6f2bf26-02fa-0b43-842b-35c0722f2b13"), "smartwatch", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Smartwatch", 5, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), "laptop", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Laptop", 3, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "device_catalog_os_families",
                columns: new[] { "Id", "Code", "CreatedAt", "IsActive", "Name", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), "windows", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Windows", 6, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("2b7ab139-3c0e-4841-97bb-7514a5af7ae8"), "hyperos", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "HyperOS", 10, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("5c55421b-8c6e-d14e-b111-2e2cf318080e"), "macos", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "macOS", 3, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("8654f562-9e82-544c-a56c-27e25bc58283"), "watchos", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "watchOS", 4, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), "android", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Android", 5, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), "ios", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "iOS", 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("bfa57965-0a5f-2247-880d-d8bff4f707c9"), "oneui", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "One UI", 9, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("c93eb52d-7eb0-104f-ac87-c2544b430a02"), "wearos", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Wear OS", 8, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("f20cca29-8181-7b4f-8c4a-613c128d1bc7"), "ipados", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "iPadOS", 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("f9b94cd7-ee56-bc4d-8065-bda9b70d5adc"), "ubuntu", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Ubuntu", 7, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "device_catalog_models",
                columns: new[] { "Id", "BrandId", "Code", "CreatedAt", "DefaultOsFamilyId", "DeviceTypeId", "IsActive", "Name", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("01d52241-709b-7d4a-9d99-6bb94f708e7d"), new Guid("b559d7a8-c7e1-9448-a725-38e4fbe83099"), "acer-swift-3", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Swift 3", 60, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("0a10fe46-64cb-fb47-999c-d66f79b512fb"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "apple-watch-ultra-2", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("8654f562-9e82-544c-a56c-27e25bc58283"), new Guid("d6f2bf26-02fa-0b43-842b-35c0722f2b13"), true, "Apple Watch Ultra 2", 17, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("0a2bc592-aeac-514e-8a16-08c43a393310"), new Guid("e62cd2ba-d704-9a44-8f67-7396ddde96a9"), "dell-inspiron-14", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Inspiron 14", 44, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("0a933ce7-2334-e941-b643-6dd256c9624c"), new Guid("01a92e92-73bb-ee44-a24a-bfd696d3632f"), "lenovo-yoga-7", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Yoga 7", 55, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("0de7d8ee-076e-6143-80b6-00fbd096c447"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "imac", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("5c55421b-8c6e-d14e-b111-2e2cf318080e"), new Guid("31091e8b-4d96-9f45-8904-ebea99dbf7a7"), true, "iMac", 14, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("0f9f7a96-ddcf-174e-bc25-a16d70bc9aef"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "iphone-16-pro-max", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "iPhone 16 Pro Max", 8, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("1301158a-d337-3746-844b-5bc05fc904ef"), new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "pixel-tablet", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), true, "Pixel Tablet", 35, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("14d8062d-40bf-4f43-830f-fe5b69f3c49b"), new Guid("a641753d-3b78-8848-9911-37e378174199"), "surface-pro-9", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), true, "Surface Pro 9", 40, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("1a137d90-e767-3943-9d64-f309fc035f55"), new Guid("324eb3d1-19fc-c047-9974-2811ce609513"), "hp-spectre-x360", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Spectre x360", 48, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("20ece17d-3233-bb4c-a78a-05a930398942"), new Guid("b559d7a8-c7e1-9448-a725-38e4fbe83099"), "acer-aspire-5", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Aspire 5", 61, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("22473983-ce0d-6f4b-afc7-28b198650b5e"), new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "pixel-8-pro", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Pixel 8 Pro", 31, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("272d4039-0357-5c49-ade9-f10bba3f195e"), new Guid("01a92e92-73bb-ee44-a24a-bfd696d3632f"), "lenovo-ideapad-slim-5", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "IdeaPad Slim 5", 56, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("2837caf5-491b-144a-a902-ab4d58c9665d"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-watch-6", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("c93eb52d-7eb0-104f-ac87-c2544b430a02"), new Guid("d6f2bf26-02fa-0b43-842b-35c0722f2b13"), true, "Galaxy Watch 6", 29, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("38d6d99a-d945-ed49-9cb7-10d18de26173"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "apple-watch-series-9", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("8654f562-9e82-544c-a56c-27e25bc58283"), new Guid("d6f2bf26-02fa-0b43-842b-35c0722f2b13"), true, "Apple Watch Series 9", 16, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("45ac5cf8-f15e-ef47-ae4e-4b8148bbd92f"), new Guid("01a92e92-73bb-ee44-a24a-bfd696d3632f"), "lenovo-thinkpad-x1-carbon", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "ThinkPad X1 Carbon", 53, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("4606cbe3-f490-464e-859f-521a5a8b0edd"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "iphone-15-pro-max", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "iPhone 15 Pro Max", 4, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("4ceb177d-6537-3142-876d-458a1e58c9d7"), new Guid("6888a3d6-fcd5-514b-8845-65fb0f090fce"), "asus-vivobook-15", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Vivobook 15", 58, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("4ea98cbe-b351-9244-8be7-ff63f5b41e0b"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-a55", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy A55", 25, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("522a4943-6fc0-f146-9623-373fbca07bd8"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "iphone-15-plus", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "iPhone 15 Plus", 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("57a87a25-0c03-8e4a-a5a6-de89be9cd69e"), new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "pixel-watch-3", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("c93eb52d-7eb0-104f-ac87-c2544b430a02"), new Guid("d6f2bf26-02fa-0b43-842b-35c0722f2b13"), true, "Pixel Watch 3", 37, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("5a5b469f-f7ef-934b-b524-e75b98b8f38f"), new Guid("324eb3d1-19fc-c047-9974-2811ce609513"), "hp-envy-x360", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Envy x360", 49, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("61dde7a7-1c66-f342-bcbc-a8de645318ce"), new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "pixel-9", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Pixel 9", 32, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("64db4a89-2502-eb4d-ac89-304301e6a769"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-s23-ultra", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy S23 Ultra", 20, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("65670912-0256-2e4e-aa67-4b380e932ea6"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "macbook-pro", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("5c55421b-8c6e-d14e-b111-2e2cf318080e"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "MacBook Pro", 13, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("68d225ef-d256-a241-9275-8049f0b507ae"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "iphone-15", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "iPhone 15", 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("6b300030-6e32-8f4b-9333-1817eb9e7524"), new Guid("324eb3d1-19fc-c047-9974-2811ce609513"), "hp-pavilion-14", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Pavilion 14", 50, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("6c899440-53a8-0f42-b4fb-2955f6789785"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "ipad-mini", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("f20cca29-8181-7b4f-8c4a-613c128d1bc7"), new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), true, "iPad mini", 11, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("6e6883d1-8f60-624b-a59d-74b730ef1a3a"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "ipad-pro", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("f20cca29-8181-7b4f-8c4a-613c128d1bc7"), new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), true, "iPad Pro", 10, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("71e55c46-4a0e-5b45-9d48-761ab8aa8c8a"), new Guid("6888a3d6-fcd5-514b-8845-65fb0f090fce"), "asus-rog-zephyrus-g14", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "ROG Zephyrus G14", 59, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("72f113c3-9380-9944-87d7-8a4855dbede8"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-z-flip-5", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy Z Flip 5", 26, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("771913d2-c35f-bd49-bea5-f69ea0516b38"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "ipad-air", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("f20cca29-8181-7b4f-8c4a-613c128d1bc7"), new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), true, "iPad Air", 9, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("79b29ca4-7490-4647-a1fc-9c269ed4c6fc"), new Guid("6888a3d6-fcd5-514b-8845-65fb0f090fce"), "asus-zenbook-14", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Zenbook 14", 57, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("85e1d6f2-516c-0f49-8cd8-d12ab2717489"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-s23-plus", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy S23+", 19, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("86c6b9e2-149a-144f-94f6-d313f1a425c3"), new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "pixel-8", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Pixel 8", 30, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("874c5694-73a8-3f4f-b19a-ce01dc236c20"), new Guid("69bcbf05-d4f0-5848-9412-12ebf19ffab5"), "xiaomi-14", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Xiaomi 14", 64, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("8f7143d0-db58-f641-96ee-3920f592a18c"), new Guid("69bcbf05-d4f0-5848-9412-12ebf19ffab5"), "xiaomi-pad-6", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), true, "Pad 6", 65, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("9761bf87-c615-fe4f-9d58-88be6000e52a"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-s24-plus", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy S24+", 22, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("9766cc4d-3927-314a-9dab-4761ff3dccc6"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-z-fold-5", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy Z Fold 5", 27, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("9878f7d9-e393-634a-afa4-e04f3b6a6775"), new Guid("69bcbf05-d4f0-5848-9412-12ebf19ffab5"), "xiaomi-redmi-note-13", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Redmi Note 13", 63, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("9f788d05-4886-b147-8f85-37d02274324d"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-s24", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy S24", 21, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a1fd70a1-571e-b347-9bb9-ccdd7aebf74f"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-s24-ultra", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy S24 Ultra", 23, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a3edf50a-bdec-194d-b0fd-7830e8c32561"), new Guid("e62cd2ba-d704-9a44-8f67-7396ddde96a9"), "dell-latitude-5440", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Latitude 5440", 46, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a90ccf8a-46a1-7448-9853-3f31002039a3"), new Guid("a641753d-3b78-8848-9911-37e378174199"), "surface-laptop-5", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Surface Laptop 5", 38, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("ab4ddbad-b278-8242-992e-f55b66e15dea"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "iphone-16-plus", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "iPhone 16 Plus", 6, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("b7d4b58f-7d62-2c47-b8eb-216f0b52b840"), new Guid("324eb3d1-19fc-c047-9974-2811ce609513"), "hp-elitebook-840", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "EliteBook 840", 52, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("bf8556de-08a0-f847-9dbc-cc03131fcdf5"), new Guid("69bcbf05-d4f0-5848-9412-12ebf19ffab5"), "xiaomi-watch-2", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, new Guid("d6f2bf26-02fa-0b43-842b-35c0722f2b13"), true, "Watch 2", 66, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("bfd685e3-d624-4248-9070-f8596c91eb2a"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-tab-s9", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), true, "Galaxy Tab S9", 28, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("cbca490e-ddd2-3e46-9d85-c6aa38d5ebc8"), new Guid("01a92e92-73bb-ee44-a24a-bfd696d3632f"), "lenovo-thinkpad-t14", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "ThinkPad T14", 54, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("d09a97fb-53c7-3a44-a8b9-27dd511d4fe4"), new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "pixel-watch-2", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("c93eb52d-7eb0-104f-ac87-c2544b430a02"), new Guid("d6f2bf26-02fa-0b43-842b-35c0722f2b13"), true, "Pixel Watch 2", 36, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("d8804aea-efbf-b246-b467-037c18801042"), new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "pixel-9-pro-xl", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Pixel 9 Pro XL", 34, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("d8a58847-3ca1-3c44-bad7-9c85e7580e83"), new Guid("8f5d427e-6df5-0446-8cb2-97eb0e5eabff"), "pixel-9-pro", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Pixel 9 Pro", 33, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("da431a71-a84e-c743-8f35-f6ef66939a77"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-s23", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy S23", 18, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("dab116fa-daeb-f947-b672-18af888b9fa1"), new Guid("b559d7a8-c7e1-9448-a725-38e4fbe83099"), "acer-nitro-5", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Nitro 5", 62, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("dae82a71-6403-7d41-8f34-04e1ad3bb638"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "iphone-16-pro", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "iPhone 16 Pro", 7, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("dc18ddd7-0238-fe40-84df-d833d52648e2"), new Guid("e62cd2ba-d704-9a44-8f67-7396ddde96a9"), "dell-xps-13", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "XPS 13", 42, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("dcdf284c-36ba-2542-8bbd-add82e7108a0"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "mac-mini", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("5c55421b-8c6e-d14e-b111-2e2cf318080e"), new Guid("31091e8b-4d96-9f45-8904-ebea99dbf7a7"), true, "Mac mini", 15, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("e35d6704-baa4-0946-92b0-352f8dc5d39c"), new Guid("a641753d-3b78-8848-9911-37e378174199"), "surface-pro-10", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("a23ecc34-552d-5047-8e8f-30005c805a9c"), true, "Surface Pro 10", 41, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("e9e4ad28-2cb4-a04e-89c5-c7816d579131"), new Guid("324eb3d1-19fc-c047-9974-2811ce609513"), "hp-pavilion-15", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Pavilion 15", 51, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("ed5aa000-27fa-094f-8944-073243343842"), new Guid("363e75f3-de5a-0640-9ffc-b3bf088ea017"), "galaxy-a54", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "Galaxy A54", 24, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("ee49e448-ec7e-8449-a032-f9563fa9452f"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "iphone-15-pro", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "iPhone 15 Pro", 3, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("ef2dc621-1062-a940-a2bd-894a8b7c6076"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "macbook-air", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("5c55421b-8c6e-d14e-b111-2e2cf318080e"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "MacBook Air", 12, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("f14c7bcc-ef03-1543-8ce5-c9f4659f68e2"), new Guid("a641753d-3b78-8848-9911-37e378174199"), "surface-laptop-6", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Surface Laptop 6", 39, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("f25293c5-680a-7e47-8ce1-6687e9250b32"), new Guid("440d1e68-363d-a647-93b1-da1cdc2d220d"), "iphone-16", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), new Guid("65690780-19c1-d840-9ff2-4432fa65b4f4"), true, "iPhone 16", 5, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("f5b19d18-524d-754a-9c97-9ad02113f88f"), new Guid("e62cd2ba-d704-9a44-8f67-7396ddde96a9"), "dell-xps-15", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "XPS 15", 43, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("f94f2b51-1e42-d349-b09d-634f4a8374c1"), new Guid("e62cd2ba-d704-9a44-8f67-7396ddde96a9"), "dell-latitude-7440", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Latitude 7440", 47, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("fdcf4254-829d-ed45-849a-35212f12e257"), new Guid("e62cd2ba-d704-9a44-8f67-7396ddde96a9"), "dell-inspiron-15", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), new Guid("e27772fe-93e0-1744-877b-e1a850c8e940"), true, "Inspiron 15", 45, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "device_catalog_os_versions",
                columns: new[] { "Id", "Code", "CreatedAt", "IsActive", "Name", "OsFamilyId", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("06e162f0-9be6-b547-9106-67e39da4d011"), "ubuntu-22.04", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "22.04", new Guid("f9b94cd7-ee56-bc4d-8065-bda9b70d5adc"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("2c932ac4-9688-6d46-91cc-b737873159de"), "ios-18", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "18", new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("3796bfb1-e4e7-1443-b662-a02f130e3e95"), "hyperos-1", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "1", new Guid("2b7ab139-3c0e-4841-97bb-7514a5af7ae8"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("395e7daf-ae04-8d40-9ddc-14e737719358"), "oneui-5", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "5", new Guid("bfa57965-0a5f-2247-880d-d8bff4f707c9"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("49210b4b-6283-9b42-bf85-e7ab4affb4a2"), "android-13", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "13", new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("59c39b6a-7a88-324e-892f-072fbb1f30a0"), "windows-10", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "10", new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("5e0c1e46-dde4-624f-b7cf-2d143fea9075"), "ubuntu-24.04", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "24.04", new Guid("f9b94cd7-ee56-bc4d-8065-bda9b70d5adc"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("604fa251-a31d-4148-9ff3-d5dd5c4e68ec"), "wearos-5", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "5", new Guid("c93eb52d-7eb0-104f-ac87-c2544b430a02"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("720df34a-b896-cc41-94c1-a52813011014"), "android-14", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "14", new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("727bf3ea-c9d4-c64b-a72f-a976a5dfa093"), "macos-sequoia", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Sequoia", new Guid("5c55421b-8c6e-d14e-b111-2e2cf318080e"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("844f0ecb-4e9f-4d4b-a8d6-eb5121193d22"), "windows-11", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "11", new Guid("138348e1-e8dc-414e-9861-ad235042fac2"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("9c131b09-81eb-254f-87fc-726d8fa0b8b0"), "ipados-18", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "18", new Guid("f20cca29-8181-7b4f-8c4a-613c128d1bc7"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a7bb6922-a5c5-5545-b725-d5210bc2b443"), "ios-17", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "17", new Guid("a65e26b7-632d-3a4d-b073-c84fbcbe6a99"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("a7db7995-85dc-de4e-9fb0-4948f3b3e3b9"), "watchos-11", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "11", new Guid("8654f562-9e82-544c-a56c-27e25bc58283"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("abec2e79-fdc8-e44f-96fa-b5fdfa0812ef"), "android-15", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "15", new Guid("a45ee8df-4a09-c540-80bc-77874893b284"), 3, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("ac250f91-fda0-7241-8da4-2e4e600969ce"), "watchos-10", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "10", new Guid("8654f562-9e82-544c-a56c-27e25bc58283"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("d4b23f9e-cb4a-5447-a623-7b7ac88e4d0a"), "ipados-17", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "17", new Guid("f20cca29-8181-7b4f-8c4a-613c128d1bc7"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("d5e6149e-5f9d-5542-9b8b-18293e64a384"), "hyperos-2", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "2", new Guid("2b7ab139-3c0e-4841-97bb-7514a5af7ae8"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("e3603352-1d91-124d-9e24-713cfb699311"), "oneui-6", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "6", new Guid("bfa57965-0a5f-2247-880d-d8bff4f707c9"), 2, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("e49e4ecc-fdf2-f745-8bc9-e83164b93730"), "macos-sonoma", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Sonoma", new Guid("5c55421b-8c6e-d14e-b111-2e2cf318080e"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("f79e204e-c0fb-9444-9506-7a8485d12ce9"), "wearos-4", new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "4", new Guid("c93eb52d-7eb0-104f-ac87-c2544b430a02"), 1, new DateTimeOffset(new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_devices_CatalogBrandId",
                table: "devices",
                column: "CatalogBrandId");

            migrationBuilder.CreateIndex(
                name: "IX_devices_CatalogDeviceTypeId",
                table: "devices",
                column: "CatalogDeviceTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_devices_CatalogModelId",
                table: "devices",
                column: "CatalogModelId");

            migrationBuilder.CreateIndex(
                name: "IX_devices_CatalogOsFamilyId",
                table: "devices",
                column: "CatalogOsFamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_devices_CatalogOsVersionId",
                table: "devices",
                column: "CatalogOsVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_brands_Code",
                table: "device_catalog_brands",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_device_types_Code",
                table: "device_catalog_device_types",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_models_BrandId_DeviceTypeId",
                table: "device_catalog_models",
                columns: new[] { "BrandId", "DeviceTypeId" });

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_models_Code",
                table: "device_catalog_models",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_models_DefaultOsFamilyId",
                table: "device_catalog_models",
                column: "DefaultOsFamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_models_DeviceTypeId",
                table: "device_catalog_models",
                column: "DeviceTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_os_families_Code",
                table: "device_catalog_os_families",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_os_versions_Code",
                table: "device_catalog_os_versions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_catalog_os_versions_OsFamilyId",
                table: "device_catalog_os_versions",
                column: "OsFamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_devices_device_catalog_brands_CatalogBrandId",
                table: "devices",
                column: "CatalogBrandId",
                principalTable: "device_catalog_brands",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_devices_device_catalog_device_types_CatalogDeviceTypeId",
                table: "devices",
                column: "CatalogDeviceTypeId",
                principalTable: "device_catalog_device_types",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_devices_device_catalog_models_CatalogModelId",
                table: "devices",
                column: "CatalogModelId",
                principalTable: "device_catalog_models",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_devices_device_catalog_os_families_CatalogOsFamilyId",
                table: "devices",
                column: "CatalogOsFamilyId",
                principalTable: "device_catalog_os_families",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_devices_device_catalog_os_versions_CatalogOsVersionId",
                table: "devices",
                column: "CatalogOsVersionId",
                principalTable: "device_catalog_os_versions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_devices_device_catalog_brands_CatalogBrandId",
                table: "devices");

            migrationBuilder.DropForeignKey(
                name: "FK_devices_device_catalog_device_types_CatalogDeviceTypeId",
                table: "devices");

            migrationBuilder.DropForeignKey(
                name: "FK_devices_device_catalog_models_CatalogModelId",
                table: "devices");

            migrationBuilder.DropForeignKey(
                name: "FK_devices_device_catalog_os_families_CatalogOsFamilyId",
                table: "devices");

            migrationBuilder.DropForeignKey(
                name: "FK_devices_device_catalog_os_versions_CatalogOsVersionId",
                table: "devices");

            migrationBuilder.DropTable(
                name: "device_catalog_models");

            migrationBuilder.DropTable(
                name: "device_catalog_os_versions");

            migrationBuilder.DropTable(
                name: "device_catalog_brands");

            migrationBuilder.DropTable(
                name: "device_catalog_device_types");

            migrationBuilder.DropTable(
                name: "device_catalog_os_families");

            migrationBuilder.DropIndex(
                name: "IX_devices_CatalogBrandId",
                table: "devices");

            migrationBuilder.DropIndex(
                name: "IX_devices_CatalogDeviceTypeId",
                table: "devices");

            migrationBuilder.DropIndex(
                name: "IX_devices_CatalogModelId",
                table: "devices");

            migrationBuilder.DropIndex(
                name: "IX_devices_CatalogOsFamilyId",
                table: "devices");

            migrationBuilder.DropIndex(
                name: "IX_devices_CatalogOsVersionId",
                table: "devices");

            migrationBuilder.DropColumn(
                name: "CatalogBrandId",
                table: "devices");

            migrationBuilder.DropColumn(
                name: "CatalogDeviceTypeId",
                table: "devices");

            migrationBuilder.DropColumn(
                name: "CatalogModelId",
                table: "devices");

            migrationBuilder.DropColumn(
                name: "CatalogOsFamilyId",
                table: "devices");

            migrationBuilder.DropColumn(
                name: "CatalogOsVersionId",
                table: "devices");

            migrationBuilder.AlterColumn<string>(
                name: "OsVersion",
                table: "devices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "OsName",
                table: "devices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Model",
                table: "devices",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "DeviceType",
                table: "devices",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30,
                oldDefaultValue: "Other");

            migrationBuilder.AlterColumn<string>(
                name: "Brand",
                table: "devices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldDefaultValue: "");
        }
    }
}
