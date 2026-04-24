# RecruiterIQ Backend — Implementation Plan

## Context

The frontend at `/recruiter` is a Next.js app with full UI but zero real API calls — everything uses mock data. The `reqruiter-backend/` directory is completely empty. This plan covers building the full production-grade Express/TypeScript backend that the frontend expects, with no unprotected endpoints, per-route rate limiting, and documented modular architecture.

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node.js + TypeScript | Type safety, matches frontend TS types |
| Framework | Express.js | Battle-tested, rich middleware ecosystem |
| ODM + DB | Mongoose + MongoDB | Schema-first, flexible documents |
| Auth | JWT (access + refresh tokens) | Stateless, scalable |
| Password hash | bcryptjs | Secure password storage |
| Validation | Zod | Shares schema style with frontend |
| Rate limiting | express-rate-limit | Per-route configurable |
| Security headers | Helmet | OWASP headers out of the box |
| File uploads | Multer | CV upload handling |
| AI | @google/generative-ai (gemini-1.5-flash) | Candidate scoring, summaries |
| Env validation | Zod | Fail-fast on missing env vars |

---

## Directory Structure

```
reqruiter-backend/
├── src/
│   ├── config/
│   │   ├── env.ts            # Zod env validation — fails fast if vars missing
│   │   ├── database.ts       # Mongoose connection
│   │   └── app.ts            # Express app factory (middlewares, routes)
│   ├── middleware/
│   │   ├── auth.ts           # JWT access token verification (protects all non-public routes)
│   │   ├── rateLimiter.ts    # Rate limit presets (strict/standard/ai/upload)
│   │   ├── errorHandler.ts   # Global error handler → standardized JSON errors
│   │   ├── upload.ts         # Multer config (CV: PDF/DOC/DOCX, max 5MB)
│   │   └── validate.ts       # Zod request body/params/query validator factory
│   ├── models/
│   │   ├── Recruiter.model.ts    # Recruiter + RecruiterRole enum
│   │   ├── RefreshToken.model.ts # Refresh token with TTL index
│   │   ├── Candidate.model.ts    # Candidate + CandidateStatus enum
│   │   ├── Department.model.ts   # Department + DepartmentStatus enum
│   │   └── JobVacancy.model.ts   # JobVacancy referencing Department
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts      # POST /auth/login, /auth/signup, /auth/refresh, /auth/logout
│   │   │   ├── auth.controller.ts  # Route handlers
│   │   │   ├── auth.service.ts     # Business logic (hash, token gen)
│   │   │   └── auth.schema.ts      # Zod schemas for login/signup bodies
│   │   ├── candidates/
│   │   │   ├── candidates.routes.ts
│   │   │   ├── candidates.controller.ts
│   │   │   ├── candidates.service.ts
│   │   │   └── candidates.schema.ts
│   │   ├── departments/
│   │   │   ├── departments.routes.ts
│   │   │   ├── departments.controller.ts
│   │   │   ├── departments.service.ts
│   │   │   └── departments.schema.ts
│   │   ├── vacancies/
│   │   │   ├── vacancies.routes.ts
│   │   │   ├── vacancies.controller.ts
│   │   │   ├── vacancies.service.ts
│   │   │   └── vacancies.schema.ts
│   │   ├── dashboard/
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   └── dashboard.service.ts
│   │   └── ai/
│   │       ├── ai.routes.ts
│   │       ├── ai.controller.ts
│   │       └── ai.service.ts       # Gemini integration
│   ├── utils/
│   │   ├── ApiResponse.ts    # { success, data, message } wrapper
│   │   ├── ApiError.ts       # Custom error classes with HTTP status
│   │   └── jwt.ts            # signAccessToken, signRefreshToken, verify helpers
│   └── server.ts             # Entry point: start HTTP server
├── uploads/
│   └── .gitkeep
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Mongoose Models

### Recruiter
```ts
{ name, email (unique), password (hashed), role: 'MANAGING_DIRECTOR'|'HR_MANAGER', timestamps }
```

### RefreshToken
```ts
{ token (unique), recruiterId (ref Recruiter), expiresAt: Date }
// TTL index: expires automatically via MongoDB TTL
```

### Candidate
```ts
{
  name, email, phone, positionApplied, department?,
  cvFileName, cvFilePath,
  status: 'PENDING'|'PENDING_INTERVIEW'|'ACCEPTED'|'REJECTED',
  matchScore?: Number,
  strengths: [String],
  weaknesses: [String],
  aiSummary?: String,
  timestamps
}
```

### Department
```ts
{ name (unique), employeeCount: Number, capacity: Number, status: 'FULFILLED'|'PENDING', timestamps }
```

### JobVacancy
```ts
{ title, company, salaryMin, salaryMax, departmentId (ref Department), experience, applicantCount, imageUrl?, timestamps }
```

---

## API Routes + Protection Matrix

### Public routes (no JWT required)
| Method | Route | Rate Limit | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | 5 req/15min/IP | Recruiter registration |
| POST | `/api/auth/login` | 5 req/15min/IP | Recruiter login |
| POST | `/api/auth/refresh` | 10 req/15min/IP | Refresh access token |
| POST | `/api/candidates/apply` | 10 req/hour/IP | Candidate CV submission |

### Protected routes (JWT required — Bearer token)
| Method | Route | Rate Limit | Description |
|---|---|---|---|
| POST | `/api/auth/logout` | 30/15min/user | Revoke refresh token |
| GET | `/api/dashboard/stats` | 100/15min/user | Stat cards |
| GET | `/api/dashboard/top-candidates` | 100/15min/user | AI-ranked candidates |
| GET | `/api/dashboard/chart-data` | 100/15min/user | Bar/pie chart data |
| GET | `/api/candidates` | 100/15min/user | List with search & filter |
| GET | `/api/candidates/:id` | 100/15min/user | Candidate detail |
| PATCH | `/api/candidates/:id/status` | 60/15min/user | Update status |
| GET | `/api/departments` | 100/15min/user | List departments |
| POST | `/api/departments` | 30/15min/user | Create department |
| PATCH | `/api/departments/:id` | 60/15min/user | Update employee count |
| DELETE | `/api/departments/:id` | 20/15min/user | Delete department |
| GET | `/api/vacancies` | 100/15min/user | List vacancies |
| POST | `/api/vacancies` | 30/15min/user | Create vacancy |
| PATCH | `/api/vacancies/:id` | 60/15min/user | Update vacancy |
| DELETE | `/api/vacancies/:id` | 20/15min/user | Delete vacancy |
| POST | `/api/ai/analyze/:candidateId` | 20/hour/user | Trigger Gemini analysis |

---

## Security Architecture

1. **Helmet** — sets Content-Security-Policy, X-Frame-Options, HSTS, etc.
2. **CORS** — allow-list origin (frontend URL from env), credentials: true
3. **JWT** — access tokens (15min), refresh tokens (7d) stored in MongoDB for revocation
4. **bcryptjs** — password hashing with salt rounds = 12
5. **Zod validation** — every request body/params/query validated; 400 on invalid input
6. **Multer** — file type whitelist (pdf/doc/docx), 5MB max, UUID filename to prevent path traversal
7. **express-rate-limit** — per-route presets, keyed by IP for public, by user ID for authenticated
8. **Body size limit** — `express.json({ limit: '10kb' })` to prevent payload attacks
9. **MongoDB injection** — Mongoose sanitizes queries; `express-mongo-sanitize` strips `$` operators from user input

---

## AI Service (Google Gemini)

`ai.service.ts` uses `gemini-1.5-flash` to analyze candidate applications:
- Input: candidate data (name, position, CV text extracted from filename/metadata)
- Prompt asks Gemini to return structured JSON: `{ matchScore, strengths, weaknesses, aiSummary }`
- Output parsed and stored back on the Candidate document
- Triggered automatically after CV upload (async, non-blocking)
- Rate limit: 20 calls/hour per authenticated user for manual re-analysis

---

## Environment Variables (.env.example)

```
MONGODB_URI="mongodb://localhost:27017/recruiteriq"
JWT_ACCESS_SECRET="change_me_access"
JWT_REFRESH_SECRET="change_me_refresh"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
GEMINI_API_KEY="..."
UPLOAD_DIR="./uploads"
FRONTEND_URL="http://localhost:3000"
PORT=4000
NODE_ENV="development"
```

---

## Implementation Order

1. **Project scaffolding** — `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`
2. **Config layer** — `env.ts`, `database.ts`, `app.ts`
3. **Mongoose models** — all 5 models with indexes
4. **Utils** — `ApiResponse`, `ApiError`, `jwt.ts`
5. **Middleware** — `auth.ts`, `rateLimiter.ts`, `errorHandler.ts`, `upload.ts`, `validate.ts`
6. **Auth module** — signup, login, refresh, logout
7. **Candidates module** — apply (public + file upload), list, detail, status update
8. **Departments module** — CRUD
9. **Vacancies module** — CRUD
10. **Dashboard module** — aggregated stats via Mongoose aggregation pipelines
11. **AI module** — Gemini integration, trigger + store results
12. **`server.ts`** — final wiring + startup logs

---

## Verification

```bash
cd reqruiter-backend
npm install
npm run dev

# Test public candidate apply:
curl -X POST http://localhost:4000/api/candidates/apply \
  -F "name=John Doe" -F "email=j@test.com" -F "phone=123456789" \
  -F "positionApplied=Backend Developer" -F "cv=@resume.pdf"

# Test auth login:
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recruiteriq.com","password":"Admin1234!"}'

# Test protected route without token (should return 401):
curl http://localhost:4000/api/dashboard/stats

# Test rate limit — 6th login attempt should return 429:
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x","password":"x"}'
done
```
