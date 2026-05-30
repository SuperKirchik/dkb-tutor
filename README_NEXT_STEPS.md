# Tutor Platform Next Steps

This project is now a Next.js App Router prototype with Prisma/PostgreSQL scaffolding.

## Run locally

```powershell
npm run dev
```

Open http://localhost:3000.

## Connect PostgreSQL

The app already has Prisma, API routes, and admin forms wired for real database writes.

### Option A: Docker Desktop

Install Docker Desktop, then run:

```powershell
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://127.0.0.1:3000/admin.

### Option B: Neon or Supabase

1. Create a PostgreSQL database in Neon or Supabase.
2. Copy the connection string.
3. Put it into `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

Then run:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## What is already prepared

- App routes for the landing page, login, student cabinet, schedule, homework, lesson page, profile, and admin panel.
- Prisma models for `User`, `Lesson`, `HomeworkSubmission`, and `Payment`.
- API route skeletons for auth, students, lessons, homework submissions, and payments.
- Admin panel forms that create students, create lessons, and update payment statuses through API routes.
- `docker-compose.yml` for local PostgreSQL.
- `prisma/seed.mjs` with demo accounts and lessons.

## Demo accounts after seed

- Admin: `teacher@example.com`
- Student: `anya@example.com`
- Password for both: `12345678`

## Next implementation work

- Add protected routes and role checks.
- Store uploaded files in local storage or S3.
- Replace remaining student dashboard mock cards with Prisma queries.
- Add edit/delete flows.
