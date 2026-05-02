# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinanceTracker is a full-stack personal finance app. The backend is a Django 5.2 REST API with JWT auth; the frontend is React 19 + TypeScript + Vite.

## Commands

### Backend
```bash
# Activate virtual environment (Windows)
source .venv/Scripts/activate

# Run dev server (from repo root)
python backend/manage.py runserver

# Run migrations
python backend/manage.py migrate

# Run all backend tests
python backend/manage.py test transactions

# Run a single test class
python backend/manage.py test transactions.tests.UserTests
```

### Frontend
```bash
cd frontend

npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # Type-check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Environment
Frontend reads `VITE_API_URL` from `frontend/.env` — default is `http://127.0.0.1:8000/`.

## Architecture

### Backend (`backend/`)

- **`FinanceTracker/settings.py`** — Django config. JWT tokens: 30-min access, 1-day refresh. CORS is fully permissive (dev only).
- **`transactions/models.py`** — Three models: Django's built-in `User`, `Category` (name + user FK), `Transaction` (user, category nullable FK, type INCOME/EXPENSE, amount, date, notes).
- **`transactions/serializer.py`** — `UserSerializer` uses `create_user()` for password hashing. `TransactionSerializer` exposes `category_id` as a nullable PrimaryKeyRelatedField.
- **`transactions/views.py`** — Three ViewSets. All list/create actions filter or assign by `request.user`. `UserViewSet` has custom `register` and `login` actions (AllowAny). Other endpoints require `IsAuthenticated`.
- **`FinanceTracker/urls.py`** — Router registers `transactions`, `categories`, `users`. Note: category delete uses the singular URL `/api/category/{id}/` (not `/api/categories/{id}/`).

### Frontend (`frontend/src/`)

- **`api.ts`** — Axios instance. Request interceptor injects `Authorization: Bearer <token>` from `localStorage`.
- **`constants.ts`** — `ACCESS_TOKEN = "access"`, `REFRESH_TOKEN = "refresh"` — keys used for localStorage.
- **`App.tsx`** — React Router setup. Protected routes wrapped in `<ProtectedRoute>`.
- **`components/ProtectedRoute.tsx`** — Validates JWT expiry via `jwtDecode`; silently refreshes if expired, redirects to `/login` if unauthorized.
- **`components/Form.tsx`** — Generic login/register form; posts to a route prop, stores tokens in localStorage on success.
- **`pages/Home.tsx`** — Main dashboard: lists transactions, category dropdown, create/delete transaction form.
- **`pages/Categories.tsx`** — Lists and deletes categories; renders `<CategoryForm>` for creation.
- **`pages/Transactions.tsx`**, **`pages/Analytics.tsx`** — Stubs, not yet implemented.

### Auth Flow
1. POST credentials → `/api/users/login/` → receives `{ access, refresh }` JWT tokens
2. Tokens stored in `localStorage` under keys `"access"` / `"refresh"`
3. Every API request gets `Authorization: Bearer <access>` via Axios interceptor
4. `ProtectedRoute` checks token expiry on each navigation; refreshes via `/api/token/refresh/` if needed

## Key Conventions

### Django conventions
- Use class-based views where appropriate
- Models live in their respective app's models.py
- API uses Django REST Framework
- Never modify migration files directly

### Frontend conventions
- UI components use shadcn/ui — always prefer shadcn primitives over custom HTML
- Add new shadcn components via CLI: `npx shadcn@latest add <component>`
  DO NOT manually create files in /components/ui — shadcn manages these
- Tailwind CSS for all styling — no inline styles. Component-specific CSS files live in `frontend/src/styles/` where needed
- Functional React components with hooks only
- TypeScript strict mode — always type props and return values
- All API calls use the configured Axios instance from `frontend/src/api.ts`; do not create separate Axios instances

### General rules
- Don't refactor code unless explicitly asked
- Always run migrations after model changes
- Ask before installing new dependencies