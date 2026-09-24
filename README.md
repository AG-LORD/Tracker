# Life Tracker

Life Tracker is a personal activity, study, health, and diary tracking application. It consists of a Next.js frontend and a FastAPI backend backed by PostgreSQL.

## Current status

The project foundation is in place and includes:

- Next.js 16 frontend with TypeScript, React 19, Tailwind CSS, and ESLint
- FastAPI backend with CORS, health checks, and versioned configuration
- PostgreSQL persistence through SQLAlchemy and Alembic
- Google OAuth sign-in with an HTTP-only access-token cookie
- Authenticated user lookup and logout endpoints
- Generic activity types and activity creation/listing endpoints
- Study subjects and study-session creation, including study reflections
- Database models and migrations for activities, study, exercise, walking, sleep, reading, meditation, projects, diary entries, calendar events, labels, and OAuth accounts
- Dashboard UI with recent activity data, Google login, a general log modal, and a study log flow

The dashboard navigation already includes Calendar, Analytics, Study, Health, Projects, and Diary areas. Their broader views and analytics are planned follow-up work; the current backend foundation is centered on authentication, activities, and study tracking.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python, SQLAlchemy, Pydantic
- Database: PostgreSQL
- Migrations: Alembic
- Authentication: Google OAuth, JWT, HTTP-only cookies

## Repository structure

```text
frontend/
	app/          Next.js pages and dashboard components
	lib/          API helper and shared frontend types
backend/
	app/
		core/       Configuration and security
		db/         Database engine and dependencies
		models/     SQLAlchemy models
		routes/     FastAPI route handlers
		schemas/    Pydantic request and response schemas
		services/   Authentication and Google token services
	alembic/      Database migrations
	tests/        Backend tests
```

## Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- PostgreSQL
- A Google OAuth web client ID

## Backend setup

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set the values in `backend/.env` for the database URL, JWT secret, and Google OAuth configuration. Apply migrations and start the API:

```powershell
alembic upgrade head
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. The health endpoint is available at `GET /health`, and interactive API documentation is available at `http://localhost:8000/docs`.

## Frontend setup

From the repository root:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local` with the backend URL and Google client ID:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

Start the development server:

```powershell
npm run dev
```

The frontend runs at `http://localhost:3000`.

## API surface

Implemented routes currently include:

- `GET /health`
- `POST /auth/google`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /activity-types`
- `POST /activities`
- `GET /activities`
- `GET /activities/{activity_id}`
- `GET /study/subjects`
- `POST /study/subjects`
- `POST /study/sessions`

Authenticated routes use the access-token cookie created during Google login.

## MVP flow

Google login → Dashboard → New Log or New Study Log → Save → Activity data appears in the dashboard.

The application uses activities as the shared timeline record. Specialized tracking models, such as study sessions, extend an activity with domain-specific details while preserving one source of truth for the user's timeline.
