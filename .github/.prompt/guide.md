You are working on a full-stack product named SafeFamily.

Tech stack:
- Frontend: React + TypeScript + Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- lucide-react
- framer-motion

Backend:
- ASP.NET Core 8 Web API
- EF Core
- PostgreSQL
- DTO-based API contracts
- Business logic in services
- Guid IDs
- Validation on backend and frontend

Architecture rules:
- Frontend uses feature folders under src/features
- Backend uses feature folders under Features/*
- Keep controllers thin
- Keep API layer separate from UI
- Use reusable form components where appropriate
- Add full feature support, not only create mode
- Include loading, empty, and error states
- Include list/detail/edit/archive flows where appropriate
- Include report/export/admin hooks if the feature needs it
- Keep the implementation production-friendly and consistent with the existing SafeFamily design system

Now implement the requested feature as a complete end-to-end feature.