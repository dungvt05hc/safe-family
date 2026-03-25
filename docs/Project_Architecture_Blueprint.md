# SafeFamily — Project Architecture Blueprint

> Generated: 23 March 2026  
> Stack: .NET 9 (ASP.NET Core) · React 18 · TypeScript · PostgreSQL · Docker

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Diagram (C4 Level 2)](#2-system-diagram-c4-level-2)
3. [Backend — Vertical-Slice Feature Architecture](#3-backend--vertical-slice-feature-architecture)
4. [Frontend — Feature-Sliced React Architecture](#4-frontend--feature-sliced-react-architecture)
5. [Data Architecture](#5-data-architecture)
6. [Cross-Cutting Concerns](#6-cross-cutting-concerns)
7. [API Contract](#7-api-contract)
8. [Security Model](#8-security-model)
9. [Technology Stack Reference](#9-technology-stack-reference)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Testing Architecture](#11-testing-architecture)
12. [Extension Guide — Adding a New Feature](#12-extension-guide--adding-a-new-feature)
13. [Architectural Decision Records](#13-architectural-decision-records)
14. [Common Pitfalls](#14-common-pitfalls)

---

## 1. Architecture Overview

SafeFamily is a digital-safety management platform for families. It is structured as a **full-stack monorepo** with two independently deployable applications:

| App | Technology | Entry Point |
|-----|-----------|-------------|
| `apps/api` | .NET 9 — ASP.NET Core Web API | `Program.cs` |
| `apps/web` | React 18 + Vite + TypeScript | `src/main.tsx` |

### Guiding Architectural Principles

1. **Thin controllers, rich services** — controllers do only HTTP-concern work (parsing, status codes, auth claims). All business logic lives in `IXxxService` / `XxxService` pairs.
2. **Vertical slice per feature** — each feature is a self-contained folder under `Features/` containing its controller, service, interface, and DTOs. This ensures cohesive, low-coupling units.
3. **Domain purity** — entities in `Domain/` carry no framework references. They describe business facts only.
4. **EF Core as the ORM** — the `AppDbContext` is the single database gateway; all queries go through it either directly in services, or via the generic `Repository<T>` base class.
5. **Interface-first** — every service exposes an `IXxxService` interface; the DI container binds the concrete implementation. This enables clean unit testing via mocking.
6. **One-way data flow in the frontend** — React components consume server state from TanStack Query hooks and mutation hooks; they never maintain derived state from props.

---

## 2. System Diagram (C4 Level 2)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              SafeFamily System                               │
│                                                                              │
│  ┌──────────────────────────┐          ┌──────────────────────────────────┐  │
│  │   React Web App (SPA)    │  HTTPS   │     ASP.NET Core Web API         │  │
│  │                          │◄────────►│                                  │  │
│  │  Vite · React 18 · TS    │  Cookie  │  .NET 9 · EF Core · Npgsql       │  │
│  │  TanStack Query          │  Auth    │  Cookie Auth · Rate Limiting      │  │
│  │  React Hook Form + Zod   │          │  Swagger · CORS                  │  │
│  └──────────────────────────┘          └──────────────┬───────────────────┘  │
│                                                        │                      │
│                                              PostgreSQL│16                    │
│                                         ┌──────────────▼───────────────────┐ │
│                                         │  safefamilydb (PostgreSQL 16)     │ │
│                                         │  Docker: postgres:16-alpine       │ │
│                                         └──────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Map (C4 Level 3 — Backend)

```
SafeFamily.Api
├── Program.cs                ← Host, DI registrations, middleware pipeline
├── Common/
│   ├── Exceptions/           ← AppException hierarchy (400/401/403/404/409)
│   ├── Extensions/           ← IServiceCollection / IApplicationBuilder extension methods
│   │   ├── AuthExtensions    ← Cookie auth + role-based authorization policies
│   │   ├── CorsExtensions    ← CORS policy (AllowedOrigins from config)
│   │   ├── DatabaseExtensions← EF Core + Npgsql + retry-on-failure
│   │   ├── SecurityExtensions← Rate limiters + security headers middleware
│   │   └── SwaggerExtensions ← OpenAPI docs
│   ├── Middleware/
│   │   └── ExceptionHandlingMiddleware ← Converts exceptions → JSON error responses
│   └── Services/
│       ├── IAuditLogService  ← Audit trail contract
│       └── AuditLogService   ← Writes AuditLog entities to DB
├── Data/
│   ├── AppDbContext          ← Single EF Core DbContext; auto-timestamps BaseEntity
│   └── Configurations/       ← IEntityTypeConfiguration<T> per entity (16 files)
├── Domain/                   ← Pure entity definitions, enums — no framework deps
│   ├── Common/               ← BaseEntity, AuditableEntity
│   ├── Accounts/             ← Account, AccountType, TwoFactorStatus, RecoveryStatus
│   ├── Admin/                ← AuditLog
│   ├── Assessments/          ← Assessment, AssessmentAnswer, AssessmentQuestionBank…
│   ├── Bookings/             ← Booking, BookingChannel, PaymentStatus
│   ├── Checklists/           ← ChecklistItem, ChecklistCategory, ChecklistSourceType
│   ├── Devices/              ← Device
│   ├── Families/             ← Family, FamilyMember, FamilyPerson
│   ├── Incidents/            ← Incident, IncidentType, IncidentSeverity, IncidentStatus
│   └── Users/                ← User, UserRole
├── Features/                 ← One sub-folder per vertical slice
│   ├── Accounts/             
│   ├── Admin/                
│   ├── Assessments/          
│   ├── Auth/                 
│   ├── Bookings/             
│   ├── Checklists/           
│   ├── Dashboard/            
│   ├── Devices/              
│   ├── Families/             
│   ├── Health/               
│   └── Incidents/            
├── Infrastructure/
│   └── Repositories/         ← Generic IRepository<T> / Repository<T> base class
└── Migrations/               ← EF Core migration history
```

---

## 3. Backend — Vertical-Slice Feature Architecture

Each feature under `Features/` follows an identical internal structure:

```
Features/
└── <FeatureName>/
    ├── I<FeatureName>Service.cs   ← interface contract
    ├── <FeatureName>Service.cs    ← EF Core implementation; injected as scoped
    ├── <FeatureName>Controller.cs ← [ApiController] [Route("api/...")] [Authorize]
    └── Dtos/
        └── <FeatureName>Dtos.cs   ← C# records / classes for request & response
```

### Service Implementation Pattern

```csharp
// Interface — defines the contract, enables mocking in tests
public interface IIncidentService
{
    Task<IncidentResponse> CreateIncidentAsync(Guid userId, CreateIncidentRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<IncidentResponse>> GetIncidentsAsync(Guid userId, CancellationToken ct = default);
}

// Implementation — injects AppDbContext directly (no intermediate repo for complex features)
public class IncidentService : IIncidentService
{
    private readonly AppDbContext _db;

    public IncidentService(AppDbContext db) => _db = db;

    // ── Private helper shared by all service methods ──────────────────────
    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var member = await _db.FamilyMembers.FirstOrDefaultAsync(m => m.UserId == userId, ct)
            ?? throw new ForbiddenException("You are not a member of any family.");
        return member.FamilyId;
    }
}
```

**Key patterns:**
- Services inject `AppDbContext` directly — no repository indirection for complex queries (EF Core's LINQ is the query layer).
- `RequireFamilyIdAsync(userId)` is a private helper present in every family-scoped service. It enforces that the user belongs to a family before querying family data.
- DTOs are C# `record` types for immutability; request types use `class` with `required` properties and `[Required]` data annotations.
- Responses are returned from `ToResponse()` private helpers for projection consistency.

### Controller Implementation Pattern

```csharp
[ApiController]
[Route("api/incidents")]
[Authorize]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _incidentService;
    private readonly IAuditLogService _audit;

    public IncidentsController(IIncidentService incidentService, IAuditLogService audit)
    {
        _incidentService = incidentService;
        _audit = audit;
    }

    [HttpPost]
    [EnableRateLimiting("mutations")]
    [ProducesResponseType(typeof(IncidentResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateIncident([FromBody] CreateIncidentRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _incidentService.CreateIncidentAsync(userId, request, ct);
        await _audit.LogAsync("IncidentCreated", userId, entityType: "Incident", entityId: result.Id, ct: ct);
        return CreatedAtAction(nameof(GetIncidents), result);
    }
}
```

**Conventions:**
- `User.FindFirstValue(ClaimTypes.NameIdentifier)` extracts the authenticated user's ID from the cookie session principal.
- `[ProducesResponseType]` attributes are used on all endpoints for accurate Swagger documentation.
- Rate limiting policies (`"auth"`, `"mutations"`) are applied with `[EnableRateLimiting("policyName")]`.
- Admin-only endpoints use `[Authorize(Roles = "Admin")]` at the class level.

### DI Registration Pattern

All services are registered in `Program.cs` as **Scoped** (per-request lifetime):

```csharp
builder.Services.AddScoped<IIncidentService, IncidentService>();
// Shared cross-cutting services
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
// Domain-specific helper services (pure, no I/O) registered as Scoped for consistency
builder.Services.AddScoped<RiskScoringService>();
builder.Services.AddScoped<ChecklistGenerationService>();
```

---

## 4. Frontend — Feature-Sliced React Architecture

### Directory Structure

```
src/
├── app/
│   ├── providers.tsx    ← Composes QueryClientProvider + RouterProvider
│   └── router.tsx       ← createBrowserRouter — all route definitions
├── components/
│   └── layout/          ← RootLayout, PageLayout (shared shell components)
├── features/            ← One folder per domain feature (mirrors backend slices)
│   └── <feature>/
│       ├── <feature>.types.ts     ← TypeScript interfaces mirroring backend DTOs
│       ├── <feature>.service.ts   ← apiClient calls — returns typed Promises
│       ├── hooks/
│       │   ├── use<Feature>Queries.ts   ← TanStack Query useQuery hooks
│       │   └── use<Feature>Mutations.ts ← TanStack Query useMutation hooks
│       ├── components/            ← Feature-specific UI components
│       └── pages/                 ← Route-level page components
├── hooks/               ← Shared utility hooks (e.g. useDisclosure)
├── lib/
│   ├── api-client.ts    ← Typed axios wrapper (get/post/put/patch/del)
│   ├── api.ts           ← Re-exports
│   └── queryClient.ts   ← Singleton QueryClient configuration
├── pages/               ← Top-level pages not owned by a feature (Dashboard, NotFound)
└── types/
    └── api.ts           ← ApiError class + ApiErrorBody interface
```

### Data Flow

```
Page Component
    │
    ├── useXxxQueries (TanStack Query useQuery)
    │       └── xxxService.getXxx()
    │               └── apiClient.get<T>('/api/xxx')
    │                       └── axios → ASP.NET Core API → DB
    │
    └── useXxxMutations (TanStack Query useMutation)
            └── xxxService.createXxx(data)
                    └── apiClient.post<T>('/api/xxx', data)
                            → onSuccess: queryClient.invalidateQueries(key)
```

### Service Layer Pattern

```typescript
// features/incidents/incidents.service.ts
import { apiClient } from '@/lib/api-client'
import type { Incident, CreateIncidentRequest } from './incidents.types'

export const incidentsService = {
  getIncidents: (): Promise<Incident[]> =>
    apiClient.get<Incident[]>('/api/incidents'),

  createIncident: (data: CreateIncidentRequest): Promise<Incident> =>
    apiClient.post<Incident>('/api/incidents', data),
}
```

### Query Hook Pattern

```typescript
// features/incidents/hooks/useIncidentQueries.ts
export const incidentKeys = {
  all:  ['incidents']          as const,
  list: ['incidents', 'list']  as const,
}

export function useIncidents() {
  return useQuery({
    queryKey: incidentKeys.list,
    queryFn:  incidentsService.getIncidents,
  })
}
```

### Mutation Hook Pattern

```typescript
// features/incidents/hooks/useIncidentMutations.ts
export function useCreateIncident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: incidentsService.createIncident,
    onSuccess: () => qc.invalidateQueries({ queryKey: incidentKeys.list }),
  })
}
```

### Route Guard Components

| Component | Location | Behaviour |
|-----------|----------|-----------|
| `ProtectedRoute` | `features/auth/components/` | Redirects to `/login` if not authenticated |
| `GuestRoute` | `features/auth/components/` | Redirects to `/dashboard` if authenticated |
| `AdminRoute` | `features/admin/components/` | Redirects non-admins to `/dashboard`, unauthenticated to `/login` |

---

## 5. Data Architecture

### Entity Hierarchy

```
BaseEntity (abstract)
│  ├── Id: Guid  (auto-generated)
│  ├── CreatedAt: DateTimeOffset  (auto-set by AppDbContext.SaveChangesAsync)
│  └── UpdatedAt: DateTimeOffset  (auto-updated by AppDbContext.SaveChangesAsync)
│
└── AuditableEntity : BaseEntity (abstract)
    ├── CreatedById: Guid?   (set by application code)
    └── UpdatedById: Guid?
```

All domain entities inherit from one of these two base classes. `User` inherits directly from `BaseEntity` (no "created by" concept for self-registration). All other entities use `AuditableEntity`.

### Entity Relationship Map

```
User ─────────────── FamilyMember ──────────── Family
(1)                  (many-to-many)              (1)
                                                  │
                          ┌───────────────────────┤
                          │                       │
                       FamilyPerson           FamilyMember
                       Account                 (pivot)
                       Device
                       Assessment ─── AssessmentAnswer
                       ChecklistItem
                       Incident
                       Booking ───────── ServicePackage

AuditLog (standalone — no FK to User for resilience)
```

### Key Relationships

| Relationship | Cardinality | FK Direction |
|---|---|---|
| User ↔ Family | Many-to-many via `FamilyMember` | FamilyMember.UserId, FamilyMember.FamilyId |
| Family → Account | 1:many | Account.FamilyId |
| Family → Device | 1:many | Device.FamilyId |
| Family → Assessment | 1:many | Assessment.FamilyId |
| Assessment → AssessmentAnswer | 1:many | AssessmentAnswer.AssessmentId |
| Family → ChecklistItem | 1:many | ChecklistItem.FamilyId |
| Family → Incident | 1:many | Incident.FamilyId |
| Family → Booking | 1:many | Booking.FamilyId |
| Booking → ServicePackage | many:1 | Booking.PackageId |
| AuditLog | standalone | UserId? (no FK constraint — intentional) |

### EF Core Configuration

All entity configurations are in `Data/Configurations/` as `IEntityTypeConfiguration<T>` classes. They are auto-discovered via:

```csharp
modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
```

**Conventions used in configurations:**
- Table names: `snake_case` plurals (e.g. `audit_logs`, `checklist_items`)
- Enums: stored as `string` with `.HasConversion<string>()` — human-readable in DB, avoids migration pain from enum reordering
- Timestamps: auto-managed by `AppDbContext.SaveChangesAsync` override
- Indexes: defined in configuration files per query patterns (e.g. `(FamilyId, QuestionId)` on `AssessmentAnswer`)
- Retry on failure: `EnableRetryOnFailure(maxRetryCount: 3)` on the Npgsql provider

### Domain Enums

| Enum | Values | Stored As |
|---|---|---|
| `UserRole` | `User`, `Admin` | string |
| `AccountType` | email, social, banking… | string |
| `TwoFactorStatus` | `Disabled`, `Enabled`, `Unknown` | string |
| `RecoveryStatus` | `NotSet`, `Set`, `Unknown` | string |
| `AssessmentCategory` | `AccountSecurity`, `DeviceHygiene`, `BackupRecovery`, `PrivacySharing`, `ScamReadiness` | string |
| `RiskLevel` | `Low`, `Medium`, `High`, `Critical` | string |
| `ChecklistCategory` | `AccountSecurity`, `DeviceHealth`, `BackupRecovery` | string |
| `ChecklistSourceType` | `Account`, `Device` | string |
| `ChecklistItemStatus` | `Pending`, `Done`, `Dismissed` | string |
| `IncidentType` | phishing, malware, account compromise… | string |
| `IncidentSeverity` | `Low`, `Medium`, `High`, `Critical` | string |
| `IncidentStatus` | `Open`, `InProgress`, `Resolved`, `Dismissed` | string |
| `BookingChannel` | `Online`, `Phone`, `InPerson` | string |
| `PaymentStatus` | `Pending`, `Paid`, `Refunded`, `Waived` | string |

### Migration History

| Migration | Date | Contents |
|---|---|---|
| _(initial)_ | Prior | Users, Families, FamilyMembers, Accounts, Devices |
| `AddAssessments` | 2026-03-21 | Assessments, AssessmentAnswers, question bank seeding |
| `AddChecklists` | 2026-03-22 | ChecklistItems, ServicePackages |
| `AddIncidentsAndBookings` | 2026-03-22 | Incidents, Bookings |
| `AddAdminAndAuditLog` | 2026-03-23 | AuditLogs table; `role` column on users; `status` column on incidents |

---

## 6. Cross-Cutting Concerns

### Error Handling

**Backend** — `ExceptionHandlingMiddleware` (registered first in pipeline):

```
Request
  → try/catch
  → AppException subclass → WriteErrorResponse(statusCode, message)
  → unhandled Exception   → 500 + generic message (no details leaked)
```

Exception types and their HTTP codes:

| Exception | HTTP |
|---|---|
| `NotFoundException` | 404 |
| `ConflictException` | 409 |
| `ForbiddenException` | 403 |
| `UnauthorizedException` | 401 |
| `AppException` (base) | 400 (configurable) |

All errors return `{ "error": "message" }` JSON.

**Frontend** — `ApiError` class wraps axios errors:

```typescript
catch (err) {
  if (err instanceof ApiError && err.isUnauthorized) {
    // redirect to login
  }
}
```

Semantic helpers: `isNetworkError`, `isUnauthorized`, `isForbidden`, `isNotFound`, `isConflict`, `isServerError`.

### Authentication & Authorization

- **Mechanism**: ASP.NET Core Cookie Authentication (`sf_session` cookie, `HttpOnly`, `SameSite=Lax`)
- **Session lifetime**: 7 days sliding expiration
- **Claims in cookie**: `NameIdentifier` (UserId), `Email`, `Name` (DisplayName), `Role` (UserRole enum as string)
- **Role authorization**: `[Authorize(Roles = "Admin")]` on `AdminController`; `"Admin"` also registered as a named policy
- **Frontend enforcement**: `AdminRoute` component checks `user.role === 'Admin'` client-side as a UX guard (not a security boundary — backend is the real enforcement)

### Rate Limiting

Implemented via `Microsoft.AspNetCore.RateLimiting` (ASP.NET Core built-in, no extra package needed):

| Policy | Applies To | Limit |
|---|---|---|
| `"auth"` | `POST /api/auth/login`, `POST /api/auth/register` | 10 req/min per client |
| `"mutations"` | `POST /api/incidents`, `POST /api/bookings` | 20 req/min per client |

Rejected requests return `429 Too Many Requests`.

### Security Headers

Applied by `UseSecurityHeaders()` middleware (inline `app.Use`):

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

### Audit Logging

`IAuditLogService.LogAsync(...)` writes immutable `AuditLog` records to the `audit_logs` table.

Events currently logged:

| Event | Trigger |
|---|---|
| `RegisterSuccess` | After successful `POST /api/auth/register` |
| `LoginSuccess` | After successful `POST /api/auth/login` |
| `LoginFailure` | After failed login attempt (email only, no password data) |
| `IncidentCreated` | After successful `POST /api/incidents` |
| `BookingCreated` | After successful `POST /api/bookings` |
| `AdminBookingStatusChanged` | `PATCH /api/admin/bookings/{id}/status` |
| `AdminIncidentStatusChanged` | `PATCH /api/admin/incidents/{id}/status` |

`AuditLog` intentionally has no FK constraint on `UserId` — so failed login attempts (no authenticated user ID) can still be recorded without breaking referential integrity.

### Validation

- **Backend**: ASP.NET Core model binding validates `[Required]` annotations and type coercion automatically. Invalid models return `400 Bad Request` before reaching the controller action.
- **Frontend**: React Hook Form + Zod schemas validate forms client-side before submission. Server errors (409 conflicts, 422 business rule violations) surface via `ApiError` in mutation `onError` callbacks.

### CORS

Configured in `CorsExtensions`:
- Origins read from `AllowedOrigins` config key (comma-separated)
- `AllowCredentials()` required for cookie-based auth to work cross-origin
- Default development value: `http://localhost:5173`

---

## 7. API Contract

### Endpoint Summary

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|-----------|-------------|
| `GET` | `/api/health` | None | — | Health check |
| `POST` | `/api/auth/register` | None | `auth` | Register new user |
| `POST` | `/api/auth/login` | None | `auth` | Login |
| `POST` | `/api/auth/logout` | None | — | Logout (clears cookie) |
| `GET` | `/api/auth/me` | Required | — | Get current user |
| `GET` | `/api/families/me` | Required | — | Get own family |
| `POST` | `/api/families` | Required | — | Create family |
| `GET` | `/api/family-members` | Required | — | List family members |
| `POST` | `/api/family-members` | Required | — | Add member |
| `PUT` | `/api/family-members/{id}` | Required | — | Update member |
| `DELETE` | `/api/family-members/{id}` | Required | — | Remove member |
| `GET` | `/api/accounts` | Required | — | List accounts |
| `POST` | `/api/accounts` | Required | — | Create account |
| `PUT` | `/api/accounts/{id}` | Required | — | Update account |
| `DELETE` | `/api/accounts/{id}` | Required | — | Delete account |
| `GET` | `/api/devices` | Required | — | List devices |
| `POST` | `/api/devices` | Required | — | Register device |
| `PUT` | `/api/devices/{id}` | Required | — | Update device |
| `DELETE` | `/api/devices/{id}` | Required | — | Remove device |
| `GET` | `/api/assessments/questions` | Required | — | Get question bank |
| `POST` | `/api/assessments` | Required | — | Submit assessment |
| `GET` | `/api/assessments/latest` | Required | — | Latest assessment result |
| `GET` | `/api/checklists` | Required | — | Get checklist items |
| `POST` | `/api/checklists/generate` | Required | — | Generate checklist from profile |
| `PATCH` | `/api/checklists/{id}/status` | Required | — | Update item status |
| `GET` | `/api/incidents` | Required | — | List incidents |
| `POST` | `/api/incidents` | Required | `mutations` | Report an incident |
| `GET` | `/api/bookings` | Required | — | List bookings |
| `POST` | `/api/bookings` | Required | `mutations` | Create booking |
| `GET` | `/api/dashboard` | Required | — | User dashboard summary |
| `GET` | `/api/admin/dashboard` | Admin | — | Admin metrics + audit log |
| `GET` | `/api/admin/customers` | Admin | — | All users |
| `GET` | `/api/admin/bookings` | Admin | — | All bookings |
| `PATCH` | `/api/admin/bookings/{id}/status` | Admin | — | Update payment status |
| `GET` | `/api/admin/incidents` | Admin | — | All incidents |
| `PATCH` | `/api/admin/incidents/{id}/status` | Admin | — | Update incident status |

### Standard Error Response Shape

```json
{ "error": "Human-readable error message." }
```

### Swagger UI

Available at `GET /swagger` in Development mode.

---

## 8. Security Model

```
                  ┌──────────────────┐
                  │   HTTPS (TLS)    │  ← app.UseHttpsRedirection()
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │ Security Headers │  ← UseSecurityHeaders()
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │   Rate Limiter   │  ← UseRateLimiter()
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │  CORS Policy     │  ← UseCors("AllowWeb")
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │ Authentication   │  ← UseAuthentication()  (reads sf_session cookie)
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │  Authorization   │  ← UseAuthorization()   ([Authorize] / [Authorize(Roles="Admin")])
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │   Controllers    │
                  └──────────────────┘
```

**Password hashing**: `Microsoft.AspNetCore.Identity.PasswordHasher<User>` (PBKDF2 with HMACSHA256, 10,000 iterations by default in ASP.NET Core Identity).

**Secrets**: Connection strings and configuration keys read from `appsettings.json` / environment variables. No secrets committed to source. Production secrets should be provided via environment variables or a secret manager (Azure Key Vault, etc.).

---

## 9. Technology Stack Reference

### Backend

| Component | Package / Version | Purpose |
|---|---|---|
| Runtime | .NET 9 | Application platform |
| Web framework | ASP.NET Core 9 | HTTP pipeline, controllers, DI |
| ORM | EF Core 9 (`Microsoft.EntityFrameworkCore`) | Database access |
| PostgreSQL driver | `Npgsql.EntityFrameworkCore.PostgreSQL` 9.0.4 | Npgsql EF provider |
| API docs | `Swashbuckle.AspNetCore` 6.9.0 | Swagger / OpenAPI |
| Password hashing | `Microsoft.AspNetCore.Identity` (built-in) | PBKDF2 hashing |
| Rate limiting | `Microsoft.AspNetCore.RateLimiting` (built-in) | Fixed-window limiters |

### Frontend

| Component | Package / Version | Purpose |
|---|---|---|
| UI framework | React 18.3 | Component rendering |
| Language | TypeScript 5.5 | Type safety |
| Build tool | Vite 5.3 | Dev server + bundler |
| Routing | React Router DOM 6.23 | Client-side routing |
| Server state | TanStack Query 5.40 | Async data fetching + caching |
| Forms | React Hook Form 7.52 + Zod 3.23 | Form validation |
| HTTP client | Axios 1.7 | HTTP requests |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |

### Infrastructure

| Component | Version | Purpose |
|---|---|---|
| PostgreSQL | 16 (Docker) | Relational database |
| Docker Compose | — | Local development database |

---

## 10. Deployment Architecture

### Local Development

```bash
# Start PostgreSQL
docker-compose up -d

# Run backend (http://localhost:5000)
cd apps/api/SafeFamily.Api && dotnet run

# Run frontend (http://localhost:5173)
cd apps/web && npm run dev
```

### Middleware Pipeline Order (critical)

```csharp
app.UseMiddleware<ExceptionHandlingMiddleware>(); // 1. Catch all exceptions
app.UseHttpsRedirection();                        // 2. Force HTTPS
app.UseSecurityHeaders();                         // 3. Security response headers
// [Swagger in Development]                       // 4. Dev tooling
app.UseCors("AllowWeb");                          // 5. CORS (before auth)
app.UseRateLimiter();                             // 6. Rate limiting
app.UseAuthentication();                          // 7. Read session cookie → set principal
app.UseAuthorization();                           // 8. Check [Authorize] attributes
app.MapControllers();                             // 9. Route to controllers
```

Order matters — swapping Authentication and Authorization, or placing CORS after auth, will break the application.

### Database Migrations

Apply migrations programmatically (suitable for dev/staging):

```csharp
await app.ApplyMigrationsAsync(); // DatabaseExtensions helper
```

Or via CLI:

```bash
cd apps/api/SafeFamily.Api
dotnet ef database update
```

### Environment Configuration

| Setting | Source | Example |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | `appsettings.json` / env var | `Host=localhost;Port=5432;Database=safefamilydb` |
| `AllowedOrigins` | `appsettings.json` / env var | `https://app.safefamily.com` |
| `ASPNETCORE_ENVIRONMENT` | Environment variable | `Production` |

---

## 11. Testing Architecture

### Backend Tests (`SafeFamily.Tests`)

Test project: `apps/api/SafeFamily.Tests/SafeFamily.Tests.csproj`

Current coverage:
- `Features/Assessments/` — unit tests for `RiskScoringService` (pure logic) and `AssessmentService` patterns
- `Features/Checklists/` — unit tests for `ChecklistGenerationService` (pure logic)

**Testing strategy:**
- **Pure services** (`RiskScoringService`, `ChecklistGenerationService`) — unit-tested directly with no mocks needed (they take data in, return data out).
- **EF Core services** — tested using an in-memory or SQLite provider (recommended) or with Moq on the DbContext for simpler cases.
- **Controllers** — use `WebApplicationFactory<Program>` integration testing for end-to-end HTTP tests.

### Frontend Testing

No test files currently. Recommended additions:
- **Unit**: Vitest + React Testing Library for hook and component tests.
- **Integration**: MSW (Mock Service Worker) to mock API calls in hook tests.
- **E2E**: Playwright for key user flows.

---

## 12. Extension Guide — Adding a New Feature

Follow these exact steps to add a new feature (e.g., `Notifications`):

### Step 1 — Domain Entity (Backend)

```csharp
// Domain/Notifications/Notification.cs
public class Notification : AuditableEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
}
```

### Step 2 — EF Configuration

```csharp
// Data/Configurations/NotificationConfiguration.cs
public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasIndex(n => n.UserId);
        // Auto-discovered by AppDbContext.ApplyConfigurationsFromAssembly
    }
}
```

### Step 3 — Add DbSet to AppDbContext

```csharp
public DbSet<Notification> Notifications => Set<Notification>();
```

### Step 4 — EF Migration

```bash
dotnet ef migrations add AddNotifications
```

### Step 5 — DTOs

```csharp
// Features/Notifications/Dtos/NotificationDtos.cs
public record NotificationResponse(Guid Id, string Title, string Body, bool IsRead, DateTimeOffset CreatedAt);
```

### Step 6 — Service Interface

```csharp
// Features/Notifications/INotificationService.cs
public interface INotificationService
{
    Task<IReadOnlyList<NotificationResponse>> GetNotificationsAsync(Guid userId, CancellationToken ct = default);
    Task<NotificationResponse> MarkReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default);
}
```

### Step 7 — Service Implementation

```csharp
// Features/Notifications/NotificationService.cs
public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    public NotificationService(AppDbContext db) => _db = db;
    // ... implement methods
}
```

### Step 8 — Controller

```csharp
// Features/Notifications/NotificationsController.cs
[ApiController] [Route("api/notifications")] [Authorize]
public class NotificationsController : ControllerBase { ... }
```

### Step 9 — Register in Program.cs

```csharp
builder.Services.AddScoped<INotificationService, NotificationService>();
```

### Step 10 — Frontend Types

```typescript
// features/notifications/notifications.types.ts
export interface Notification { id: string; title: string; body: string; isRead: boolean; createdAt: string }
```

### Step 11 — Frontend Service, Hooks, Pages

Follow the service → queries hook → mutations hook → page component pattern described in Section 4.

### Step 12 — Add Routes to router.tsx

```tsx
{ path: 'notifications', element: <ProtectedRoute><NotificationsPage /></ProtectedRoute> }
```

---

## 13. Architectural Decision Records

### ADR-001: Vertical Slice over Layered Architecture

**Context**: The project started with a feature backlog covering 10+ distinct domains.

**Decision**: Organise backend code as vertical slices (`Features/<Name>/`) rather than horizontal layers (`Controllers/`, `Services/`, `Repositories/`).

**Rationale**: Vertical slices keep all code for one feature co-located, reducing the cognitive overhead of navigating across four or five directories to understand a single endpoint. Features can evolve independently.

**Consequences**: Services in different features must not import from each other directly (use events or shared `Common/` utilities instead).

---

### ADR-002: Direct AppDbContext in Services (no Repository-per-entity)

**Context**: The generic `Repository<T>` exists but most services inject `AppDbContext` directly.

**Decision**: Complex query services use `AppDbContext` directly via LINQ; `Repository<T>` is available as a base class for CRUD-only cases.

**Rationale**: EF Core's `DbSet<T>` and LINQ already provide a clean, testable query API. Wrapping it in a repository adds a layer of indirection without meaningful abstraction benefit, and loses the ability to write efficient multi-entity queries.

**Consequences**: Services must be tested with an in-memory or SQLite `AppDbContext` rather than mocking `IRepository<T>`.

---

### ADR-003: Cookie Authentication over JWT

**Context**: The application needs stateful user sessions.

**Decision**: ASP.NET Core cookie authentication (`sf_session`) rather than JWT Bearer tokens.

**Rationale**: Cookies are `HttpOnly` and not accessible to JavaScript, providing CSRF protection. The application is a traditional SPA + API on the same domain; the added complexity of JWT refresh token management is not warranted for the MVP.

**Consequences**: Cross-origin API consumers (native mobile apps) cannot use cookie auth; they would need a separate JWT endpoint. The Swagger UI includes a Bearer token security definition as a forward-compatible provision.

---

### ADR-004: Enums Stored as Strings in PostgreSQL

**Context**: Domain enums like `IncidentStatus`, `UserRole`, `PaymentStatus` need to be persisted.

**Decision**: Use `.HasConversion<string>()` in EF configurations to store enum values as strings.

**Rationale**: Readable database rows without needing to cross-reference enum definitions. Avoids data corruption if enum integer values are accidentally reordered. New enum values can be added without a migration.

**Consequences**: Slightly more storage per row. Enum value strings must not be renamed without a data migration.

---

### ADR-005: TanStack Query for All Server State (Frontend)

**Context**: The frontend needs to fetch, cache, and synchronize server data across multiple components.

**Decision**: TanStack Query v5 for all server state; no global state manager (Redux, Zustand) for server data.

**Rationale**: TanStack Query eliminates boilerplate for loading/error states, deduplicates requests, and provides automatic background refetch + cache invalidation. Local UI state (modals, form state) is handled by `useState` / React Hook Form.

**Consequences**: All shared server state must be expressed as query keys. Cross-feature data sharing uses shared query keys + cache invalidation patterns.

---

### ADR-006: Zod + React Hook Form for Form Validation

**Context**: Multiple forms with non-trivial validation rules across the application.

**Decision**: Zod schemas as the single source of truth for form validation, wired to React Hook Form via `@hookform/resolvers/zod`.

**Rationale**: Zod schemas are TypeScript-native and can be shared between frontend validation and (eventually) backend request parsing. React Hook Form is uncontrolled-input based, providing better performance for complex forms.

---

## 14. Common Pitfalls

### Backend

1. **Forgetting to register a new service in Program.cs** — the application will throw a `InvalidOperationException` at runtime when the controller tries to resolve the service. Always add `builder.Services.AddScoped<IXxx, Xxx>()` after creating a new service pair.

2. **Missing `RequireFamilyIdAsync` scoping** — all family-scoped data access must call `RequireFamilyIdAsync(userId)` first. Omitting this will expose other families' data to any authenticated user.

3. **Adding enums without a migration** — adding a new enum value to an existing column doesn't require a migration (it's a string), but adding a new enum-typed property to an entity does. Run `dotnet ef migrations add ...` after any schema change.

4. **Placing `[EnableRateLimiting]` on a class without per-method overrides** — if the class has mixed sensitivity (e.g., a GET and a POST), decorate individual actions rather than the class.

5. **Timezone in timestamps** — all `DateTimeOffset` values use UTC. Never use `DateTime.Now`; always use `DateTimeOffset.UtcNow`.

### Frontend

1. **Using `apiClient` without the `/api/` prefix** — the base URL is the origin (no path prefix). Always use full paths like `/api/families`.

2. **Not invalidating queries after mutations** — all mutations must call `queryClient.invalidateQueries({ queryKey: ... })` in `onSuccess` to keep the UI in sync with the server.

3. **Relying on `AdminRoute` as a security boundary** — `AdminRoute` is a UX redirect, not a security check. The backend `[Authorize(Roles = "Admin")]` is the authoritative enforcement.

4. **Query key mismatch between queries and mutations** — if a mutation invalidates a key that doesn't match the query key used by `useQuery`, the UI won't refresh. Use the exported key constants (e.g., `incidentKeys.list`).

5. **Forgetting to add a route guard** — all authenticated pages must be wrapped in `<ProtectedRoute>` or `<AdminRoute>` in `router.tsx`. An unguarded route will render for unauthenticated users but API calls will return 401.

---

*Keep this document updated when new features are added, entities are modified, or architectural patterns evolve. The "Extension Guide" section should be updated if the new feature deviates from the standard pattern.*
