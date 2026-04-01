using System.Security.Cryptography;
using System.Text;
using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Data.Seed;

/// <summary>
/// Centralised seed data for the Device Catalog tables.
/// All GUIDs are deterministic (SHA-256-based) so they stay stable across migrations.
/// </summary>
public static class DeviceCatalogSeedData
{
    // Fixed epoch used for CreatedAt / UpdatedAt on every seed record.
    private static readonly DateTimeOffset Epoch = new(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);

    // ════════════════════════════════════════════════════════════════════════════
    //  Deterministic GUID helper
    // ════════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Creates a deterministic GUID from a human-readable seed string.
    /// The same input always produces the same output.
    /// </summary>
    private static Guid Id(string seed)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes("device-catalog:" + seed));
        // Take first 16 bytes and stamp as UUID v4 layout for compatibility.
        hash[6] = (byte)((hash[6] & 0x0F) | 0x40); // version 4
        hash[8] = (byte)((hash[8] & 0x3F) | 0x80); // variant 1
        return new Guid(hash[..16]);
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  Well-known IDs — referenced by model seed data for foreign keys
    // ════════════════════════════════════════════════════════════════════════════

    // ── Device type IDs ─────────────────────────────────────────────────────────
    public static class Type
    {
        public static readonly Guid Smartphone = Id("type:smartphone");
        public static readonly Guid Tablet     = Id("type:tablet");
        public static readonly Guid Laptop     = Id("type:laptop");
        public static readonly Guid Desktop    = Id("type:desktop");
        public static readonly Guid Smartwatch = Id("type:smartwatch");
        public static readonly Guid Other      = Id("type:other");
    }

    // ── Brand IDs ───────────────────────────────────────────────────────────────
    public static class Brand
    {
        public static readonly Guid Apple     = Id("brand:apple");
        public static readonly Guid Samsung   = Id("brand:samsung");
        public static readonly Guid Google    = Id("brand:google");
        public static readonly Guid Microsoft = Id("brand:microsoft");
        public static readonly Guid Dell      = Id("brand:dell");
        public static readonly Guid Hp        = Id("brand:hp");
        public static readonly Guid Lenovo    = Id("brand:lenovo");
        public static readonly Guid Asus      = Id("brand:asus");
        public static readonly Guid Acer      = Id("brand:acer");
        public static readonly Guid Xiaomi    = Id("brand:xiaomi");
    }

    // ── OS family IDs ───────────────────────────────────────────────────────────
    public static class Os
    {
        public static readonly Guid Ios     = Id("os:ios");
        public static readonly Guid IpadOs  = Id("os:ipados");
        public static readonly Guid MacOs   = Id("os:macos");
        public static readonly Guid WatchOs = Id("os:watchos");
        public static readonly Guid Android = Id("os:android");
        public static readonly Guid Windows = Id("os:windows");
        public static readonly Guid Ubuntu  = Id("os:ubuntu");
        public static readonly Guid WearOs  = Id("os:wearos");
        public static readonly Guid OneUi   = Id("os:oneui");
        public static readonly Guid HyperOs = Id("os:hyperos");
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  Seed arrays
    // ════════════════════════════════════════════════════════════════════════════

    // ── Device Types ────────────────────────────────────────────────────────────

    public static DeviceCatalogDeviceType[] GetDeviceTypes() =>
    [
        DType("smartphone", "Smartphone", 1),
        DType("tablet",     "Tablet",     2),
        DType("laptop",     "Laptop",     3),
        DType("desktop",    "Desktop",    4),
        DType("smartwatch", "Smartwatch", 5),
        DType("other",      "Other",      99),
    ];

    // ── Brands ──────────────────────────────────────────────────────────────────

    public static DeviceCatalogBrand[] GetBrands() =>
    [
        BrandRow("apple",     "Apple",     1),
        BrandRow("samsung",   "Samsung",   2),
        BrandRow("google",    "Google",    3),
        BrandRow("microsoft", "Microsoft", 4),
        BrandRow("dell",      "Dell",      5),
        BrandRow("hp",        "HP",        6),
        BrandRow("lenovo",    "Lenovo",    7),
        BrandRow("asus",      "Asus",      8),
        BrandRow("acer",      "Acer",      9),
        BrandRow("xiaomi",    "Xiaomi",    10),
    ];

    // ── OS Families ─────────────────────────────────────────────────────────────

    public static DeviceCatalogOsFamily[] GetOsFamilies() =>
    [
        OsRow("ios",     "iOS",      1),
        OsRow("ipados",  "iPadOS",   2),
        OsRow("macos",   "macOS",    3),
        OsRow("watchos", "watchOS",  4),
        OsRow("android", "Android",  5),
        OsRow("windows", "Windows",  6),
        OsRow("ubuntu",  "Ubuntu",   7),
        OsRow("wearos",  "Wear OS",  8),
        OsRow("oneui",   "One UI",   9),
        OsRow("hyperos", "HyperOS",  10),
    ];

    // ── OS Versions ─────────────────────────────────────────────────────────────

    public static DeviceCatalogOsVersion[] GetOsVersions() =>
    [
        // iOS
        OsVer("ios-17", "17", Os.Ios, 1),
        OsVer("ios-18", "18", Os.Ios, 2),

        // iPadOS
        OsVer("ipados-17", "17", Os.IpadOs, 1),
        OsVer("ipados-18", "18", Os.IpadOs, 2),

        // macOS
        OsVer("macos-sonoma",  "Sonoma",  Os.MacOs, 1),
        OsVer("macos-sequoia", "Sequoia", Os.MacOs, 2),

        // watchOS
        OsVer("watchos-10", "10", Os.WatchOs, 1),
        OsVer("watchos-11", "11", Os.WatchOs, 2),

        // Android
        OsVer("android-13", "13", Os.Android, 1),
        OsVer("android-14", "14", Os.Android, 2),
        OsVer("android-15", "15", Os.Android, 3),

        // Windows
        OsVer("windows-10", "10", Os.Windows, 1),
        OsVer("windows-11", "11", Os.Windows, 2),

        // Ubuntu
        OsVer("ubuntu-22.04", "22.04", Os.Ubuntu, 1),
        OsVer("ubuntu-24.04", "24.04", Os.Ubuntu, 2),

        // Wear OS
        OsVer("wearos-4", "4", Os.WearOs, 1),
        OsVer("wearos-5", "5", Os.WearOs, 2),

        // One UI
        OsVer("oneui-5", "5", Os.OneUi, 1),
        OsVer("oneui-6", "6", Os.OneUi, 2),

        // HyperOS
        OsVer("hyperos-1", "1", Os.HyperOs, 1),
        OsVer("hyperos-2", "2", Os.HyperOs, 2),
    ];

    // ── Models ──────────────────────────────────────────────────────────────────

    public static DeviceCatalogModel[] GetModels()
    {
        var sort = 0; // auto-increment sort order per call

        return
        [
            // ── Apple — Smartphones ────────────────────────────────────────────
            Model("iphone-15",          "iPhone 15",          Brand.Apple, Type.Smartphone, Os.Ios, ++sort),
            Model("iphone-15-plus",     "iPhone 15 Plus",     Brand.Apple, Type.Smartphone, Os.Ios, ++sort),
            Model("iphone-15-pro",      "iPhone 15 Pro",      Brand.Apple, Type.Smartphone, Os.Ios, ++sort),
            Model("iphone-15-pro-max",  "iPhone 15 Pro Max",  Brand.Apple, Type.Smartphone, Os.Ios, ++sort),
            Model("iphone-16",          "iPhone 16",          Brand.Apple, Type.Smartphone, Os.Ios, ++sort),
            Model("iphone-16-plus",     "iPhone 16 Plus",     Brand.Apple, Type.Smartphone, Os.Ios, ++sort),
            Model("iphone-16-pro",      "iPhone 16 Pro",      Brand.Apple, Type.Smartphone, Os.Ios, ++sort),
            Model("iphone-16-pro-max",  "iPhone 16 Pro Max",  Brand.Apple, Type.Smartphone, Os.Ios, ++sort),

            // ── Apple — Tablets ────────────────────────────────────────────────
            Model("ipad-air",  "iPad Air",  Brand.Apple, Type.Tablet, Os.IpadOs, ++sort),
            Model("ipad-pro",  "iPad Pro",  Brand.Apple, Type.Tablet, Os.IpadOs, ++sort),
            Model("ipad-mini", "iPad mini", Brand.Apple, Type.Tablet, Os.IpadOs, ++sort),

            // ── Apple — Laptops ───────────────────────────────────────────────
            Model("macbook-air", "MacBook Air", Brand.Apple, Type.Laptop, Os.MacOs, ++sort),
            Model("macbook-pro", "MacBook Pro", Brand.Apple, Type.Laptop, Os.MacOs, ++sort),

            // ── Apple — Desktops ──────────────────────────────────────────────
            Model("imac",     "iMac",     Brand.Apple, Type.Desktop, Os.MacOs, ++sort),
            Model("mac-mini", "Mac mini", Brand.Apple, Type.Desktop, Os.MacOs, ++sort),

            // ── Apple — Smartwatches ──────────────────────────────────────────
            Model("apple-watch-series-9", "Apple Watch Series 9", Brand.Apple, Type.Smartwatch, Os.WatchOs, ++sort),
            Model("apple-watch-ultra-2",  "Apple Watch Ultra 2",  Brand.Apple, Type.Smartwatch, Os.WatchOs, ++sort),

            // ── Samsung — Smartphones ─────────────────────────────────────────
            Model("galaxy-s23",       "Galaxy S23",       Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-s23-plus",  "Galaxy S23+",      Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-s23-ultra", "Galaxy S23 Ultra", Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-s24",       "Galaxy S24",       Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-s24-plus",  "Galaxy S24+",      Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-s24-ultra", "Galaxy S24 Ultra", Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-a54",       "Galaxy A54",       Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-a55",       "Galaxy A55",       Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-z-flip-5",  "Galaxy Z Flip 5",  Brand.Samsung, Type.Smartphone, Os.Android, ++sort),
            Model("galaxy-z-fold-5",  "Galaxy Z Fold 5",  Brand.Samsung, Type.Smartphone, Os.Android, ++sort),

            // ── Samsung — Tablets ─────────────────────────────────────────────
            Model("galaxy-tab-s9", "Galaxy Tab S9", Brand.Samsung, Type.Tablet, Os.Android, ++sort),

            // ── Samsung — Smartwatches ────────────────────────────────────────
            Model("galaxy-watch-6", "Galaxy Watch 6", Brand.Samsung, Type.Smartwatch, Os.WearOs, ++sort),

            // ── Google — Smartphones ──────────────────────────────────────────
            Model("pixel-8",        "Pixel 8",        Brand.Google, Type.Smartphone, Os.Android, ++sort),
            Model("pixel-8-pro",    "Pixel 8 Pro",    Brand.Google, Type.Smartphone, Os.Android, ++sort),
            Model("pixel-9",        "Pixel 9",        Brand.Google, Type.Smartphone, Os.Android, ++sort),
            Model("pixel-9-pro",    "Pixel 9 Pro",    Brand.Google, Type.Smartphone, Os.Android, ++sort),
            Model("pixel-9-pro-xl", "Pixel 9 Pro XL", Brand.Google, Type.Smartphone, Os.Android, ++sort),

            // ── Google — Tablets ──────────────────────────────────────────────
            Model("pixel-tablet", "Pixel Tablet", Brand.Google, Type.Tablet, Os.Android, ++sort),

            // ── Google — Smartwatches ─────────────────────────────────────────
            Model("pixel-watch-2", "Pixel Watch 2", Brand.Google, Type.Smartwatch, Os.WearOs, ++sort),
            Model("pixel-watch-3", "Pixel Watch 3", Brand.Google, Type.Smartwatch, Os.WearOs, ++sort),

            // ── Microsoft — Laptops ───────────────────────────────────────────
            Model("surface-laptop-5", "Surface Laptop 5", Brand.Microsoft, Type.Laptop, Os.Windows, ++sort),
            Model("surface-laptop-6", "Surface Laptop 6", Brand.Microsoft, Type.Laptop, Os.Windows, ++sort),

            // ── Microsoft — Tablets ───────────────────────────────────────────
            Model("surface-pro-9",  "Surface Pro 9",  Brand.Microsoft, Type.Tablet, Os.Windows, ++sort),
            Model("surface-pro-10", "Surface Pro 10", Brand.Microsoft, Type.Tablet, Os.Windows, ++sort),

            // ── Dell — Laptops ────────────────────────────────────────────────
            Model("dell-xps-13",       "XPS 13",       Brand.Dell, Type.Laptop, Os.Windows, ++sort),
            Model("dell-xps-15",       "XPS 15",       Brand.Dell, Type.Laptop, Os.Windows, ++sort),
            Model("dell-inspiron-14",  "Inspiron 14",  Brand.Dell, Type.Laptop, Os.Windows, ++sort),
            Model("dell-inspiron-15",  "Inspiron 15",  Brand.Dell, Type.Laptop, Os.Windows, ++sort),
            Model("dell-latitude-5440", "Latitude 5440", Brand.Dell, Type.Laptop, Os.Windows, ++sort),
            Model("dell-latitude-7440", "Latitude 7440", Brand.Dell, Type.Laptop, Os.Windows, ++sort),

            // ── HP — Laptops ──────────────────────────────────────────────────
            Model("hp-spectre-x360",  "Spectre x360",  Brand.Hp, Type.Laptop, Os.Windows, ++sort),
            Model("hp-envy-x360",     "Envy x360",     Brand.Hp, Type.Laptop, Os.Windows, ++sort),
            Model("hp-pavilion-14",   "Pavilion 14",   Brand.Hp, Type.Laptop, Os.Windows, ++sort),
            Model("hp-pavilion-15",   "Pavilion 15",   Brand.Hp, Type.Laptop, Os.Windows, ++sort),
            Model("hp-elitebook-840", "EliteBook 840", Brand.Hp, Type.Laptop, Os.Windows, ++sort),

            // ── Lenovo — Laptops ──────────────────────────────────────────────
            Model("lenovo-thinkpad-x1-carbon", "ThinkPad X1 Carbon", Brand.Lenovo, Type.Laptop, Os.Windows, ++sort),
            Model("lenovo-thinkpad-t14",       "ThinkPad T14",       Brand.Lenovo, Type.Laptop, Os.Windows, ++sort),
            Model("lenovo-yoga-7",             "Yoga 7",             Brand.Lenovo, Type.Laptop, Os.Windows, ++sort),
            Model("lenovo-ideapad-slim-5",     "IdeaPad Slim 5",     Brand.Lenovo, Type.Laptop, Os.Windows, ++sort),

            // ── Asus — Laptops ────────────────────────────────────────────────
            Model("asus-zenbook-14",       "Zenbook 14",       Brand.Asus, Type.Laptop, Os.Windows, ++sort),
            Model("asus-vivobook-15",      "Vivobook 15",      Brand.Asus, Type.Laptop, Os.Windows, ++sort),
            Model("asus-rog-zephyrus-g14", "ROG Zephyrus G14", Brand.Asus, Type.Laptop, Os.Windows, ++sort),

            // ── Acer — Laptops ────────────────────────────────────────────────
            Model("acer-swift-3",  "Swift 3",  Brand.Acer, Type.Laptop, Os.Windows, ++sort),
            Model("acer-aspire-5", "Aspire 5", Brand.Acer, Type.Laptop, Os.Windows, ++sort),
            Model("acer-nitro-5",  "Nitro 5",  Brand.Acer, Type.Laptop, Os.Windows, ++sort),

            // ── Xiaomi — Smartphones ──────────────────────────────────────────
            Model("xiaomi-redmi-note-13", "Redmi Note 13", Brand.Xiaomi, Type.Smartphone, Os.Android, ++sort),
            Model("xiaomi-14",           "Xiaomi 14",      Brand.Xiaomi, Type.Smartphone, Os.Android, ++sort),

            // ── Xiaomi — Tablets ──────────────────────────────────────────────
            Model("xiaomi-pad-6", "Pad 6", Brand.Xiaomi, Type.Tablet, Os.Android, ++sort),

            // ── Xiaomi — Smartwatches ─────────────────────────────────────────
            Model("xiaomi-watch-2", "Watch 2", Brand.Xiaomi, Type.Smartwatch, null, ++sort),
        ];
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  Builder helpers — keep the arrays above compact
    // ════════════════════════════════════════════════════════════════════════════

    private static DeviceCatalogDeviceType DType(string code, string name, int sort) => new()
    {
        Id = Id("type:" + code),
        Code = code,
        Name = name,
        IsActive = true,
        SortOrder = sort,
        CreatedAt = Epoch,
        UpdatedAt = Epoch,
    };

    private static DeviceCatalogBrand BrandRow(string code, string name, int sort) => new()
    {
        Id = Id("brand:" + code),
        Code = code,
        Name = name,
        IsActive = true,
        SortOrder = sort,
        CreatedAt = Epoch,
        UpdatedAt = Epoch,
    };

    private static DeviceCatalogOsFamily OsRow(string code, string name, int sort) => new()
    {
        Id = Id("os:" + code),
        Code = code,
        Name = name,
        IsActive = true,
        SortOrder = sort,
        CreatedAt = Epoch,
        UpdatedAt = Epoch,
    };

    private static DeviceCatalogOsVersion OsVer(string code, string name, Guid osFamilyId, int sort) => new()
    {
        Id = Id("osver:" + code),
        Code = code,
        Name = name,
        OsFamilyId = osFamilyId,
        IsActive = true,
        SortOrder = sort,
        CreatedAt = Epoch,
        UpdatedAt = Epoch,
    };

    private static DeviceCatalogModel Model(
        string code, string name,
        Guid brandId, Guid deviceTypeId,
        Guid? defaultOsFamilyId, int sort) => new()
    {
        Id = Id("model:" + code),
        Code = code,
        Name = name,
        BrandId = brandId,
        DeviceTypeId = deviceTypeId,
        DefaultOsFamilyId = defaultOsFamilyId,
        IsActive = true,
        SortOrder = sort,
        CreatedAt = Epoch,
        UpdatedAt = Epoch,
    };
}
