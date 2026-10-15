# Movie Ticket Booking — Supabase Edition

A full-stack starter application using React, Vite, Tailwind CSS, Node.js, Express, Supabase PostgreSQL, and JWT authentication.

## Features
- Browse movies and view details
- Register and log in
- View showtimes and select seats
- Create bookings
- View the logged-in user's bookings
- REST API with input validation and basic error handling

## Requirements
- Node.js 18+
- A Supabase project
- npm

## 1. Create the Supabase database
1. Create a project at https://supabase.com/.
2. Open **SQL Editor** in the Supabase dashboard.
3. Open `backend/supabase/schema.sql` from this project, copy all of it, and run it in SQL Editor.
4. In Supabase **Project Settings → API**, copy the Project URL and `service_role` key. The service-role key is secret and must only be used by the backend.

## 2. Configure and start the backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
Put your real `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a long random `JWT_SECRET` into `backend/.env`.

Backend runs at `http://localhost:5000`.

## 3. Configure and start the frontend
Open a second terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

## API routes
- `GET /api/health`
- `GET /api/movies`
- `GET /api/movies/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT)
- `GET /api/shows` and `GET /api/shows?movieId=<id>`
- `POST /api/bookings` (JWT)
- `GET /api/bookings/my` (JWT)

## Security and production notes
- Never put `SUPABASE_SERVICE_ROLE_KEY` in the frontend or commit it to Git.
- `.env` is excluded from Git; use `.env.example` as a template.
- This starter uses custom JWT auth and stores password hashes in Supabase Postgres. It does not use Supabase Auth.
- The seat-conflict check is demo-level and can race under concurrent requests. For production, use a PostgreSQL function/transaction that atomically reserves seats.
- No payment provider is configured.
