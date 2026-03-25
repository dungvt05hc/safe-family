# SafeFamily

A family safety application — monorepo with a React frontend and ASP.NET Core 8 backend.

## Tech Stack

| Layer    | Technology                                              |
|----------|---------------------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS                |
| State    | TanStack Query, React Hook Form, Zod                    |
| Routing  | React Router v6                                         |
| Backend  | ASP.NET Core 8, EF Core, PostgreSQL (Npgsql)            |
| Docs     | Swagger / Swashbuckle                                   |
| Dev DB   | PostgreSQL 16 via Docker Compose                        |

## Folder Structure

```
safe-family/
├── apps/
│   ├── web/          # React + Vite frontend  (port 5173)
│   └── api/          # ASP.NET Core Web API   (port 5000)
├── docs/             # Architecture & guides
├── scripts/          # Setup and dev scripts
└── docker-compose.yml
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [.NET SDK](https://dotnet.microsoft.com/) 8
- [Docker](https://www.docker.com/) (for local PostgreSQL)

## First-time Setup

```bash
chmod +x scripts/setup.sh scripts/dev.sh
./scripts/setup.sh
```

This will:
1. Install frontend npm dependencies
2. Restore .NET packages
3. Start PostgreSQL in Docker

## Running Locally

```bash
./scripts/dev.sh
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |

## Manual startup

```bash
# Terminal 1 — PostgreSQL
docker compose up -d postgres

# Terminal 2 — API
cd apps/api/SafeFamily.Api
dotnet run

# Terminal 3 — Frontend
cd apps/web
npm run dev
```

## Database Migrations

```bash
cd apps/api/SafeFamily.Api

# Create a migration
dotnet ef migrations add <MigrationName>

# Apply migrations
dotnet ef database update
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed conventions.

