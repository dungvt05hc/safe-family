# SafeFamily Architecture

## Overview

SafeFamily is a monorepo containing a React frontend and an ASP.NET Core backend, designed around a feature-based folder structure for pragmatic MVP development.

## Repository Structure

```
safe-family/
├── apps/
│   ├── web/                        # React + TypeScript + Vite frontend
│   └── api/                        # ASP.NET Core 8 Web API
│       └── SafeFamily.Api/
│           ├── Features/           # Feature-based vertical slices
│           │   └── {Feature}/
│           │       ├── {Feature}Controller.cs
│           │       ├── {Feature}Service.cs
│           │       └── Dtos/
│           ├── Data/               # EF Core DbContext & config
│           └── Common/             # Shared middleware, exceptions
├── docs/                           # Architecture & guides
├── scripts/                        # Dev setup scripts
└── docker-compose.yml              # Local PostgreSQL
```

## Frontend (`apps/web`)

| Concern          | Library                      |
|------------------|------------------------------|
| Build            | Vite 5                       |
| UI framework     | React 18 + TypeScript        |
| Routing          | React Router v6              |
| Server state     | TanStack Query v5            |
| Forms            | React Hook Form + Zod        |
| Styling          | Tailwind CSS v3              |
| HTTP client      | Axios (via `src/lib/api.ts`) |

### Frontend folder conventions

```
src/
├── features/
│   └── {feature}/
│       ├── pages/          # Route-level page components (thin)
│       ├── components/     # Feature-specific UI components
│       ├── hooks/          # useQuery / useMutation wrappers
│       ├── services/       # Typed API calls (axios)
│       └── schemas.ts      # Zod validation schemas
├── shared/
│   └── components/         # Truly reusable UI (Button, Modal, etc.)
└── lib/
    └── api.ts              # Configured axios instance
```

## Backend (`apps/api`)

| Concern          | Library / Approach           |
|------------------|------------------------------|
| Framework        | ASP.NET Core 8               |
| ORM              | Entity Framework Core 8      |
| Database         | PostgreSQL (via Npgsql)      |
| API docs         | Swagger / Swashbuckle        |
| Primary keys     | `Guid`                       |
| DTOs             | Separate request/response records — no EF entities in API |

### Backend conventions

- **Controllers** are thin: they validate HTTP concerns, call service, return result.
- **Services** hold all business logic and are registered with `IService` / `Service` pairs.
- **DTOs** live inside the feature folder under `Dtos/`.
- **EF entities** live under `Data/` or the feature folder — never returned directly from controllers.

## Local Development

See [../README.md](../README.md) for setup steps.
