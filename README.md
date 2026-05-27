# ManaboGo — Global JLPT N5 Japanese Learning Platform

ManaboGo is the world's first platform offering an accredited online JLPT N5 certificate. It combines adaptive spaced repetition (SRS), AI-powered readiness reports, real-time vocabulary battles, and a global learner community spanning 30+ countries — all built on a modern, scalable monorepo architecture designed to serve learners in English, Japanese, Bengali, Bahasa Indonesia, and Vietnamese.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                   │
│                                                                   │
│  Static/SSG pages  ◄──► AWS Amplify ◄──► Next.js 15 App Router   │
│  (landing, pricing)     (Edge CDN)        SSG / ISR / CSR         │
│                                                │                  │
│                              ┌─────────────────┤                  │
│                              │  /api/auth/*    │                  │
│                              │  proxy routes   │                  │
│                              └────────┬────────┘                  │
│                                       │ HttpOnly cookie mgmt      │
│  Authenticated app ◄──► NEXT_PUBLIC_API_URL                       │
│  (dashboard, learn)      Bearer token │                           │
│                                       ▼                           │
│                              AWS ECS (Fargate)                    │
│                              FastAPI (Python 3.12)                │
│                                  │         │         │            │
│                              Neon       Redis    Cloudflare R2    │
│                              Postgres   (cache)  (file storage)   │
│                              (asyncpg)                            │
└─────────────────────────────────────────────────────────────────┘

Monitoring: AWS CloudWatch
CI/CD: GitHub Actions → ECR (API) + Amplify (Web)
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20.x |
| npm | ≥ 10.x |
| Python | 3.12.x |
| Docker + Docker Compose | latest |
| AWS CLI | v2 |
| Neon account | [neon.tech](https://neon.tech) |

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/yousuf-sagbrain/ManaboGo.git
cd ManaboGo
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in:
#   DATABASE_URL — Neon connection string OR use docker-compose Postgres
#   REDIS_URL    — redis://localhost:6379/0
#   JWT_SECRET_KEY — min 32 random chars
#   NEXTAUTH_SECRET — min 32 random chars
```

### 3. Start local infrastructure

```bash
docker-compose up -d
# Starts: postgres:16 on :5432 | redis:7 on :6379
```

### 4. Run database migrations

```bash
cd apps/api
pip install -r requirements.txt
alembic upgrade head
cd ../..
```

### 5. Start the API server

```bash
cd apps/api
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### 6. Install frontend dependencies

```bash
npm install   # installs all workspaces (apps/web + packages/shared)
```

### 7. Start the Next.js dev server

```bash
npm run dev --workspace=apps/web
# Frontend: http://localhost:3000
```

---

## Running Tests

### Backend (pytest)

```bash
cd apps/api
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Frontend (Vitest)

```bash
npm run test --workspace=apps/web
```

### Frontend E2E (Playwright)

```bash
# Requires a running Next.js server on :3000
npm run test:e2e --workspace=apps/web
```

---

## Rendering Strategy

| Route group | Strategy | Auth | Notes |
|-------------|----------|------|-------|
| `/` | SSG | None | `force-static`, full SEO |
| `/(marketing)` | SSG | None | `/pricing`, `/about` |
| `/verify/[certId]` | ISR | None | `revalidate: 3600` |
| `/(auth)` | CSR | None | Login, register, reset |
| `/(app)` | CSR + server auth | ≥ user | Sidebar layout |
| `/(admin)` | CSR + server auth | ≥ admin | Admin shell |

---

## RBAC — Role Permission Summary

| Permission | user | pro_user | admin | super_admin |
|------------|:----:|:--------:|:-----:|:-----------:|
| `practice.basic` | ✅ | ✅ | ✅ | ✅ |
| `mock.limited` | ✅ | ✅ | ✅ | ✅ |
| `async_battle.10` | ✅ | ✅ | ✅ | ✅ |
| `practice.unlimited` | ❌ | ✅ | ✅ | ✅ |
| `mock.unlimited` | ❌ | ✅ | ✅ | ✅ |
| `readiness_report.full` | ❌ | ✅ | ✅ | ✅ |
| `sync_battle` | ❌ | ✅ | ❌ | ✅ |
| `async_battle.unlimited` | ❌ | ✅ | ✅ | ✅ |
| `offline_mode` | ❌ | ✅ | ❌ | ✅ |
| `cert_exam` | ❌ | ✅ | ❌ | ✅ |
| `admin.users.read` | ❌ | ❌ | ✅ | ✅ |
| `admin.users.write` | ❌ | ❌ | ✅ | ✅ |
| `admin.cohorts` | ❌ | ❌ | ✅ | ✅ |
| `admin.audit` | ❌ | ❌ | ✅ | ✅ |
| `admin.content.moderate` | ❌ | ❌ | ✅ | ✅ |
| `super_admin.*` | ❌ | ❌ | ❌ | ✅ |

**2FA policy:** Admin and Super Admin roles **must** configure TOTP before receiving tokens. The login endpoint returns `{ requires_2fa_setup: true }` and the Next.js middleware redirects to `/auth/2fa-setup`.

---

## Phase 0 — Task Checklist

| # | Task | Status |
|---|------|--------|
| 0 | Design system (Tailwind tokens, component variants) | ✅ |
| 1 | Monorepo structure (npm workspaces) | ✅ |
| 2 | Database schema (Alembic migration 0001) | ✅ |
| 3 | Registration endpoint + email verification | ✅ |
| 4 | Email verification endpoint | ✅ |
| 5 | Login + JWT issue + cookie | ✅ |
| 6 | Token rotation + theft detection | ✅ |
| 7 | RBAC engine (permissions.py + dependencies.py) | ✅ |
| 8 | Account settings endpoints (/users/me) | ✅ |
| 9 | Two-factor authentication (TOTP + backup codes) | ✅ |
| 10 | Social login stubs (Google, Apple, LINE) | ⏳ DEFERRABLE |
| 11 | i18n scaffold (next-intl, 5 locales) | ✅ |
| 12 | CI/CD pipelines (api.yml + web.yml) | ✅ |
| 13 | PPP pricing stub | ⏳ DEFERRABLE |
| — | Frontend auth components (all 5) | ✅ |
| — | Dashboard stubs (user, pro, admin, super_admin) | ✅ |
| — | Middleware + route protection | ✅ |
| — | Public SSG/ISR pages (landing, pricing, verify) | ✅ |
| — | Backend tests (16 test cases) | ✅ |
| — | Frontend tests (Vitest + Playwright stubs) | ✅ |

---

## Contributing

Branch naming convention:

```
feat/phase-X-task-Y-short-description
fix/phase-X-short-description
chore/description
```

Example:
```bash
git checkout -b feat/phase-0-task-7-rbac-engine
```

PRs must pass all CI checks (lint, type-check, test, build) before merge.

---

## Next Phase

**Phase 1 — Kana Mastery Port**

Tasks include porting the existing Kana Mastery System (Hiragana + Katakana flashcards, stroke recognition), integrating it with the SRS engine, and connecting to the user progress database. See `documents/03-RegistrationSection/` and Phase 1 roadmap for details.

---

## Tech Stack Summary

**Backend:** FastAPI · Python 3.12 · asyncpg · Alembic · python-jose · passlib · pyotp · Redis · SendGrid  
**Frontend:** Next.js 15 · React 19 · TypeScript 5 · Tailwind CSS 3 · Zustand 4 · next-intl 3 · jose  
**Infrastructure:** Neon Postgres · Cloudflare R2 · AWS ECS Fargate · AWS Amplify · AWS CloudWatch  
**CI/CD:** GitHub Actions  
