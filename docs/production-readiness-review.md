# SafeFamily — Production Readiness Review

> **Scope:** Full-stack audit of backend (ASP.NET Core 9 / EF Core / PostgreSQL) and frontend (React / TypeScript / Vite) before first production deployment and GitHub push.
> **Date:** Pre-deployment audit
> **Reviewer:** GitHub Copilot

---

## 1. Critical Issues — Must Fix Before Deploy

These are blockers. Deploying with any of these in place creates immediate, exploitable security holes.

---

### C-1 · Real PayOS credentials committed to git

**Files:** `appsettings.json` (line ~30), `appsettings.Development.json` (line ~30)

```json
"PayOs": {
  "ClientId":    "d0b8aa82...",   // real production value
  "ApiKey":      "dd9ca250...",   // real production value
  "ChecksumKey": "96c5caa8..."    // real production value
}
```

Both files are tracked by git (`.gitignore` does **not** exclude `appsettings.json` or `appsettings.Development.json`). Anyone with repository access — or if the repo is ever made public — has your live PayOS API credentials.

**Fix:**
1. Rotate all three credentials immediately via the PayOS dashboard.
2. Move secrets to environment variables (or .NET User Secrets / Azure Key Vault):
   ```
   PaymentSettings__PayOs__ClientId=...
   PaymentSettings__PayOs__ApiKey=...
   PaymentSettings__PayOs__ChecksumKey=...
   ```
3. Replace the hardcoded values in `appsettings.json` with `REPLACE_WITH_ENV_VAR` placeholders (matching the pattern already used in `appsettings.Production.json`).
4. Add to `.gitignore` if you ever store real values locally:
   ```
   appsettings.*.Local.json
   ```

---

### C-2 · `MockPaymentGateway` registered in production — signature bypass reachable

**File:** `apps/api/SafeFamily.Api/Program.cs` line 117

```csharp
builder.Services.AddScoped<IPaymentGateway, MockPaymentGateway>();  // no IsDevelopment() guard
```

**File:** `apps/api/SafeFamily.Api/Features/Payments/Gateways/MockPaymentGateway.cs`

```csharp
public bool VerifySignature(IHeaderDictionary headers, string rawBody)
{
    _logger.LogWarning("MockPaymentGateway: VerifySignature called — always returning true. NOT safe for production.");
    return true;   // always trusts any body
}
```

In production the webhook endpoint `POST /api/webhooks/payment/mock` is live, anonymous, and accepts any POST body. An attacker sends:

```json
{ "orderCode": 123456, "code": "00", "status": "PAID" }
```

And receives a fulfilled booking — free of charge. No credentials required.

**Fix:**

```csharp
// Program.cs — wrap the mock gateway registration
if (builder.Environment.IsDevelopment())
    builder.Services.AddScoped<IPaymentGateway, MockPaymentGateway>();

builder.Services.AddScoped<IPaymentGateway, PayOsGateway>();
builder.Services.AddScoped<IPaymentGateway, MoMoGateway>();
builder.Services.AddScoped<IPaymentGateway, ZaloPayGateway>();
```

---

### C-3 · `AuthService.LoginAsync` does not check `user.Status`

**File:** `apps/api/SafeFamily.Api/Features/Auth/AuthService.cs` lines 43–57

```csharp
public async Task<AuthUserResponse> LoginAsync(LoginRequest request, ...)
{
    var user = await _db.Users.FirstOrDefaultAsync(...);

    if (user is null || _hasher.VerifyHashedPassword(...) == Failed)
        throw new UnauthorizedException("Invalid email or password.");

    return ToResponse(user);   // ← returned immediately, no status check
}
```

A user with `UserStatus.Suspended`, `UserStatus.Locked`, or `UserStatus.Deactivated` can log in successfully. Admin actions to suspend an account have zero enforcement at the login gate.

**Fix:**

```csharp
if (user is null || _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password)
        == PasswordVerificationResult.Failed)
{
    throw new UnauthorizedException("Invalid email or password.");
}

if (user.Status != UserStatus.Active)
{
    // Use a generic message to avoid leaking account state to a potential attacker
    throw new UnauthorizedException("This account is not available.");
}

return ToResponse(user);
```

---

## 2. High-Risk Issues — Fix Before Deploy

These don't have a known exploit path on day-one but create serious risk in production.

---

### H-1 · `CookieSecurePolicy.SameAsRequest` — cookies may be sent over HTTP

**File:** `apps/api/SafeFamily.Api/Common/Extensions/AuthExtensions.cs`

```csharp
options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
```

If the API sits behind a reverse proxy (NGINX, Caddy, AWS ALB) that terminates TLS and forwards plain HTTP internally, `.SameAsRequest` will mark the session cookie **without** the `Secure` flag. The cookie will then be transmitted in cleartext on any accidental HTTP request.

**Fix:** Use `CookieSecurePolicy.Always` in production. Set via configuration:

```csharp
options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
    ? CookieSecurePolicy.SameAsRequest
    : CookieSecurePolicy.Always;
```

---

### H-2 · `AllowedOrigins` defaults to `http://localhost:5173`

**File:** `apps/api/SafeFamily.Api/appsettings.json`

```json
"AllowedOrigins": "http://localhost:5173"
```

This is the base config. If `appsettings.Production.json` is not correctly applied (it currently contains only `REPLACE_WITH_PRODUCTION_ORIGIN` placeholders), the API in production will reject all cross-origin requests from the real domain — or, worse, if CORS is misconfigured to fall back to a wildcard, allow all origins.

**Fix:** Set `AllowedOrigins` to the production HTTPS domain via environment variable:

```
AllowedOrigins=https://your-production-domain.com
```

Verify the value is active by checking startup logs.

---

### H-3 · Swagger UI accessible in all environments

**File:** `apps/api/SafeFamily.Api/Common/Extensions/SwaggerExtensions.cs`

`AddSwaggerDocs()` is called unconditionally in `Program.cs` (registering the OpenAPI metadata). `UseSwaggerDocs()` is gated by `IsDevelopment()`, so the UI itself is hidden in production — but the endpoint `/swagger/v1/swagger.json` route is not served. **This part is acceptable.** However, note that the Swagger service is still registered and `UseSwagger()` is inside `UseSwaggerDocs()`, so if someone calls `app.UseSwaggerDocs()` again without the guard it would expose the docs. Consider moving `AddSwaggerDocs()` inside the `IsDevelopment()` guard as well to make the intent explicit.

---

### H-4 · `appsettings.Production.json` contains only placeholder strings

**File:** `apps/api/SafeFamily.Api/appsettings.Production.json`

```json
{
  "ConnectionStrings": { "DefaultConnection": "REPLACE_WITH_PRODUCTION_CONNECTION_STRING" },
  "AllowedOrigins": "REPLACE_WITH_PRODUCTION_ORIGIN",
  "JwtSettings": { "SecretKey": "REPLACE_WITH_STRONG_SECRET_KEY_MIN_32_CHARS" }
}
```

If the production server does not have environment variable overrides configured, the app will start with a connection string of the literal text `REPLACE_WITH_PRODUCTION_CONNECTION_STRING` and crash. More dangerous: if it somehow doesn't crash, it will use the real PayOS keys from `appsettings.json`.

**Fix:** Ensure every `REPLACE_WITH_*` value is provided as an environment variable in the production deployment manifest (Docker Compose, Kubernetes Secret, cloud app settings). Verify at startup.

---

### H-5 · Webhook endpoint has no rate limiting

**File:** `apps/api/SafeFamily.Api/Features/Payments/PaymentsController.cs` lines 118–125

```csharp
[HttpPost("api/webhooks/payment/{provider}")]
[AllowAnonymous]           // correct — gateway doesn't authenticate
// missing: [EnableRateLimiting("mutations")] or custom webhook policy
```

No rate limit means a DoS attacker can flood `POST /api/webhooks/payment/payos` at will, filling the `WebhookLog` table and exhausting database connections.

**Fix:**

```csharp
[HttpPost("api/webhooks/payment/{provider}")]
[AllowAnonymous]
[EnableRateLimiting("mutations")]   // or a dedicated webhook policy
public async Task<IActionResult> PaymentWebhook(...)
```

Alternatively configure a per-IP fixed-window policy in `SecurityExtensions.cs` for webhook endpoints.

---

### H-6 · `JwtSettings.SecretKey` is a known placeholder in committed config

**File:** `apps/api/SafeFamily.Api/appsettings.json`

```json
"JwtSettings": {
  "SecretKey": "CHANGE_ME_REPLACE_WITH_A_STRONG_32_PLUS_CHARACTER_SECRET"
}
```

JWT is not currently the active auth mechanism (cookie auth is), but the key is registered in DI. If anyone adds JWT issuance it will use this placeholder key. Remove or override via environment variable.

---

### H-7 · Auto-migration runs on startup in production

**File:** `apps/api/SafeFamily.Api/Common/Extensions/DatabaseExtensions.cs` line 28

```csharp
/// Call only in environments where auto-migration is acceptable (e.g. dev/staging).
public static async Task ApplyMigrationsAsync(this WebApplication app)
{
    await db.Database.MigrateAsync();
}
```

The comment warns against production use, but if `ApplyMigrationsAsync()` is called from `Program.cs` at startup without an environment guard, it will attempt to migrate the live database on every pod/container restart. A migration failure mid-deployment can leave the schema in a partially applied state.

**Fix:**
- Confirm `ApplyMigrationsAsync()` is **not** called in production (check `Program.cs` call sites).
- Run migrations as a separate CI/CD step: `dotnet ef database update --connection "..."`.

---

## 3. Medium-Risk Issues

---

### M-1 · Missing `Content-Security-Policy` and `Strict-Transport-Security` headers

**File:** `apps/api/SafeFamily.Api/Common/Extensions/SecurityExtensions.cs`

Present headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`.

Missing:
- `Content-Security-Policy` — reduces XSS impact in browsers that honour it.
- `Strict-Transport-Security` (HSTS) — enforces HTTPS for repeat visitors.

**Fix (add to the security middleware):**

```csharp
context.Response.Headers["Content-Security-Policy"] =
    "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';";
context.Response.Headers["Strict-Transport-Security"] =
    "max-age=63072000; includeSubDomains; preload";
```

Tune CSP based on actual frontend asset origins before enabling.

---

### M-2 · `SameSite=Lax` allows CSRF via top-level navigation

**File:** `apps/api/SafeFamily.Api/Common/Extensions/AuthExtensions.cs`

```csharp
options.Cookie.SameSite = SameSiteMode.Lax;
```

`Lax` permits cookies to be sent on cross-site top-level GET navigations. For a REST API whose mutation endpoints are all POST/PUT/DELETE this is lower risk, but `Strict` is the safer choice for a production app.

**Fix:** Change to `SameSiteMode.Strict`. Verify no legitimate same-site flows break.

---

### M-3 · JWT localStorage fallback in API client (XSS-readable)

**File:** `apps/web/src/lib/api-client.ts` lines 29–34

```typescript
const token = localStorage.getItem('token')
if (token) {
    config.headers.Authorization = `Bearer ${token}`
}
```

The app uses HttpOnly cookie auth. This code path will never fire normally, but it:
1. Implies a token might be stored in `localStorage` at some point (XSS-readable).
2. Creates confusion about the auth mechanism for future developers.

**Fix:** Remove the interceptor entirely. The `withCredentials: true` already handles cookie auth.

---

### M-4 · No self-service password reset flow

The `User` domain model has `PasswordResetToken` and `PasswordResetExpiresAt` fields (correctly included in schema migrations), but only an admin can trigger a reset (`AdminService.TriggerPasswordResetAsync`). There is no user-facing "Forgot Password" email flow.

This is an MVP limitation, not a security bug, but users who forget their password have no recovery path without contacting support.

---

### M-5 · MoMo `IpnUrl` contains `ngrok-subdomain` placeholder

**File:** `apps/api/SafeFamily.Api/appsettings.Development.json`

```json
"IpnUrl": "https://<ngrok-subdomain>.ngrok.io/api/webhooks/payment/momo"
```

No production risk (MoMo keys are empty), but clean this up before committing.

---

### M-6 · `AllowedHosts: "*"` in base configuration

**File:** `apps/api/SafeFamily.Api/appsettings.json`

```json
"AllowedHosts": "*"
```

Allows any `Host` header. Should be locked to the production domain to prevent host-header injection attacks.

**Fix:** Override via environment variable:
```
AllowedHosts=your-production-domain.com
```

---

## 4. Security and Privacy Risks

| # | Risk | Severity | Location |
|---|------|----------|----------|
| S-1 | Full PayOS JSON response body logged at `LogDebug` level — may contain payment URLs and tokens | Medium | `PayOsGateway.cs` line 137 |
| S-2 | `RawBody` of every webhook stored in `WebhookLog.RawBody` + `PaymentOrder.GatewayRawResponse` — correct for audit but raw gateway payloads persist in DB indefinitely | Low | `PaymentWebhookService.cs` |
| S-3 | Password hashing: ASP.NET Core `PasswordHasher<User>` (PBKDF2 + HMAC-SHA256) — **acceptable** | — | `AuthService.cs` |
| S-4 | No antiforgery / CSRF tokens (relying solely on `SameSite` cookie) | Low-Medium | `AuthExtensions.cs` |
| S-5 | `PasswordResetToken` stored as plain string in `Users` table — should be stored as a hash to prevent token leakage via DB read access | Medium | `User.cs` |
| S-6 | Admin `TriggerPasswordResetAsync` sets token but no email is sent — token is returned in API response (`TriggerPasswordResetResponse`) and must be communicated to user manually. This is a data exposure risk if the admin channel is insecure | Medium | `AdminService.cs` line 1345 |

### S-1 Fix

```csharp
// PayOsGateway.cs — change LogDebug to only log safe fields
_logger.LogDebug("[payOS] Payment request response. StatusCode={StatusCode} Code={Code}",
    (int)response.StatusCode,
    doc.RootElement.GetProperty("code").GetString());
// Remove the full-body log
```

---

## 5. Payment-Specific Risks

| # | Risk | Severity |
|---|------|----------|
| P-1 | `MockPaymentGateway` registered unconditionally — `POST /api/webhooks/payment/mock` accepts any unsigned body (see C-2) | **Critical** |
| P-2 | MoMo and ZaloPay gateways have empty/stub credentials — if a booking is created with `channel = "momo"` or `"zalopay"`, the payment request will silently fail or succeed without real verification | High |
| P-3 | No rate limit on webhook endpoint (see H-5) | High |
| P-4 | PayOS response body logged at Debug (see S-1) | Medium |
| P-5 | `PaymentOrder.GatewayRawResponse` stores raw body — acceptable for audit, ensure DB at rest encryption is enabled | Low |
| P-6 | Webhook idempotency is correct — duplicate `(Provider, GatewayOrderId, EventType)` is caught by PostgreSQL unique index and rolled back atomically. **No action needed.** | ✅ |
| P-7 | PayOS HMAC-SHA256 checksum on outgoing requests is correct. **No action needed.** | ✅ |

### MoMo/ZaloPay Stub Risk

In `appsettings.json`, both gateways have empty `SecretKey` and `AppSecret` fields. Their `VerifySignature` implementations will compute an HMAC with an empty key. This means an attacker who sends a webhook body with a matching empty-key HMAC signature will successfully bypass verification. Either:
- Remove MoMo and ZaloPay gateways from DI until credentials are configured, or
- Add a guard in each gateway: throw if the secret is empty/whitespace.

---

## 6. Entitlement and Premium Access Risks

The entitlement system design is sound:

- `HasEntitlementAsync` checks `IsActive && StartsAt <= now && (ExpiresAt == null || ExpiresAt > now)` — correct.
- `EntitlementRequiredException` (HTTP 402) is thrown and caught by `ExceptionHandlingMiddleware` — correct.
- Premium controllers carry both `[Authorize]` and `[RequireFeature]` at class level — correct layering.

**One gap:**

| # | Risk |
|---|------|
| E-1 | Entitlement is checked when a user accesses plan content, but **not enforced during booking creation**. A user could create a booking for a premium package without having a valid entitlement. The entitlement check should occur in `BookingService.CreateBookingAsync` before a payment order is created, or the entitlement should be granted only after payment is confirmed (which appears to be the current flow). Verify this is intentional and document it. |

---

## 7. Deployment and Configuration Risks

| # | Item | Action |
|---|------|--------|
| D-1 | `appsettings.json` is committed with real PayOS credentials | Rotate keys, remove from file, set via environment variables |
| D-2 | `appsettings.Production.json` has `REPLACE_WITH_*` placeholders | Set all values as environment variables in deployment manifest |
| D-3 | `AllowedOrigins` defaults to `http://localhost:5173` in base config | Override with production HTTPS domain |
| D-4 | `AllowedHosts: "*"` | Override with production domain |
| D-5 | `CookieSecurePolicy.SameAsRequest` | Change to `Always` in production |
| D-6 | Auto-migration (`MigrateAsync`) on startup | Run as a pre-deployment CI/CD step; remove or environment-gate the startup call |
| D-7 | Frontend `.env.production` does not exist | Create `apps/web/.env.production` with `VITE_API_URL` and feature flags for production |
| D-8 | Frontend `VITE_FEATURE_*` flags default to `false` when absent — features will be hidden in production unless explicitly enabled | Set flags to `true` in `.env.production` for features that should be live |
| D-9 | `appsettings.Development.json` contains real PayOS keys (same as base config) | Rotate and replace with placeholders |
| D-10 | Swagger `AddSwaggerDocs()` called unconditionally (services always registered, UI is dev-only) | Move into `IsDevelopment()` guard alongside `UseSwaggerDocs()` |

### Recommended `.env.production` for frontend

```env
VITE_API_URL=https://api.your-domain.com
VITE_FEATURE_BOOKING_ENABLED=true
VITE_FEATURE_PLANS_ENABLED=true
VITE_FEATURE_PAYMENTS_ENABLED=true
```

---

## 8. Code-Level Recommendations (Exact Changes)

### 8.1 `AuthService.cs` — add status check

```csharp
// After password verification succeeds, before returning:
if (user.Status != UserStatus.Active)
    throw new UnauthorizedException("This account is not available.");
```

### 8.2 `Program.cs` — gate MockPaymentGateway

```csharp
// Replace unconditional registration:
if (builder.Environment.IsDevelopment())
    builder.Services.AddScoped<IPaymentGateway, MockPaymentGateway>();

builder.Services.AddScoped<IPaymentGateway, PayOsGateway>();
builder.Services.AddScoped<IPaymentGateway, MoMoGateway>();
builder.Services.AddScoped<IPaymentGateway, ZaloPayGateway>();
```

### 8.3 `AuthExtensions.cs` — harden cookie settings

```csharp
options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
    ? CookieSecurePolicy.SameAsRequest
    : CookieSecurePolicy.Always;
options.Cookie.SameSite = SameSiteMode.Strict;
```

### 8.4 `SecurityExtensions.cs` — add missing headers

```csharp
context.Response.Headers["Content-Security-Policy"] =
    "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';";
context.Response.Headers["Strict-Transport-Security"] =
    "max-age=63072000; includeSubDomains";
```

### 8.5 `PaymentsController.cs` — add rate limit to webhook

```csharp
[HttpPost("api/webhooks/payment/{provider}")]
[AllowAnonymous]
[EnableRateLimiting("mutations")]
public async Task<IActionResult> PaymentWebhook(...)
```

### 8.6 `api-client.ts` — remove JWT localStorage fallback

```typescript
// Delete these lines:
const token = localStorage.getItem('token')
if (token) {
    config.headers.Authorization = `Bearer ${token}`
}
```

### 8.7 `PayOsGateway.cs` — scrub sensitive data from debug log

```csharp
// Replace:
_logger.LogDebug("[payOS] Payment request response: {Body}", json);
// With:
_logger.LogDebug("[payOS] Payment request response received. OrderCode={OrderCode}", orderCode);
```

### 8.8 `appsettings.json` — remove real credentials

```json
"PayOs": {
    "ClientId":    "SET_VIA_ENV_PaymentSettings__PayOs__ClientId",
    "ApiKey":      "SET_VIA_ENV_PaymentSettings__PayOs__ApiKey",
    "ChecksumKey": "SET_VIA_ENV_PaymentSettings__PayOs__ChecksumKey"
}
```

### 8.9 MoMo/ZaloPay gateways — guard against empty secret key

In `MoMoGateway.cs` and `ZaloPayGateway.cs`, add startup validation:

```csharp
public MoMoGateway(IOptions<PaymentSettings> opts, ...)
{
    _cfg = opts.Value.MoMo;
    if (string.IsNullOrWhiteSpace(_cfg.SecretKey))
        throw new InvalidOperationException("MoMo SecretKey is not configured.");
}
```

Or skip gateway registration when credentials are absent.

---

## 9. Files and Components Needing Immediate Attention

### Backend — P0 (must fix before any production traffic)

| File | Issue |
|------|-------|
| `appsettings.json` | Real PayOS credentials committed — **rotate immediately** |
| `appsettings.Development.json` | Same credentials — **rotate immediately** |
| `Program.cs` | `MockPaymentGateway` unconditional registration |
| `Features/Auth/AuthService.cs` | Missing `user.Status` check in `LoginAsync` |

### Backend — P1 (fix before prod deploy)

| File | Issue |
|------|-------|
| `Common/Extensions/AuthExtensions.cs` | `SameAsRequest` + `SameSite=Lax` |
| `Common/Extensions/SecurityExtensions.cs` | Missing CSP + HSTS |
| `Features/Payments/PaymentsController.cs` | No rate limit on webhook |
| `Features/Payments/Gateways/PayOsGateway.cs` | Full response body logged |
| `Features/Payments/Gateways/MoMoGateway.cs` | Empty secret key not guarded |
| `Features/Payments/Gateways/ZaloPayGateway.cs` | Empty secret key not guarded |
| `Common/Extensions/DatabaseExtensions.cs` | Auto-migration must not run in production |

### Frontend — P1

| File | Issue |
|------|-------|
| `src/lib/api-client.ts` | `localStorage.getItem('token')` JWT fallback — remove |
| (missing) `.env.production` | Must be created with `VITE_API_URL` and feature flags |

### Configuration / Infrastructure — P0

| Item | Action |
|------|--------|
| PayOS credentials | Rotate now, store as environment variables |
| `AllowedOrigins` | Must be HTTPS production domain |
| `AllowedHosts` | Must be restricted to production domain |
| Cookie `SecurePolicy` | Must be `Always` in production |

---

## Summary Table

| # | Severity | Issue | Fixed by |
|---|----------|-------|----------|
| C-1 | 🔴 Critical | PayOS credentials in committed config | Remove from files, rotate, use env vars |
| C-2 | 🔴 Critical | MockPaymentGateway in production | Wrap with `IsDevelopment()` guard |
| C-3 | 🔴 Critical | Login accepts suspended accounts | Add `user.Status` check in `LoginAsync` |
| H-1 | 🟠 High | Cookie Secure = SameAsRequest | Change to `Always` in production |
| H-2 | 🟠 High | AllowedOrigins = localhost | Set production HTTPS domain via env var |
| H-3 | 🟠 High | Swagger services registered unconditionally | Move inside `IsDevelopment()` block |
| H-4 | 🟠 High | Production.json has only placeholders | Populate all env vars in deployment |
| H-5 | 🟠 High | No rate limit on webhook endpoint | Add `[EnableRateLimiting]` |
| H-6 | 🟠 High | JWT placeholder key in committed config | Remove or override via env var |
| H-7 | 🟠 High | Auto-migration on production startup | Gate with env check or remove from startup |
| M-1 | 🟡 Medium | Missing CSP + HSTS headers | Add to `SecurityExtensions` |
| M-2 | 🟡 Medium | SameSite=Lax | Change to `Strict` |
| M-3 | 🟡 Medium | JWT localStorage fallback in api-client.ts | Remove the interceptor |
| M-4 | 🟡 Medium | No user-facing password reset flow | Backlog item for post-launch |
| M-5 | 🟡 Medium | ngrok placeholder in dev config | Clean up before commit |
| M-6 | 🟡 Medium | AllowedHosts: "*" | Override with production domain |
| S-1 | 🟡 Medium | Full PayOS response body in debug log | Log only safe fields |
| S-5 | 🟡 Medium | PasswordResetToken stored plaintext | Hash before storing |
| P-2 | 🟠 High | MoMo/ZaloPay accept empty-key HMAC | Guard against empty secrets |
