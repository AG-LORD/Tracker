# Life Tracker

A personal life analytics and digital diary application.

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: FastAPI + Python
- Database: PostgreSQL + SQLAlchemy
- Authentication: Google OAuth
- Charts: Recharts
- Analytics/ML: Pandas, NumPy, scikit-learn
- AI: LLM API integration

## Repository structure

```text
frontend/   Next.js application
backend/    FastAPI application
```

## MVP flow

Login → Dashboard → New Log → Activity form → Save → Dashboard/analytics update.

The application uses a single source of truth for activity data so Dashboard, Health, Study, Statistics, Calendar, and Diary can present different views of the same records.
