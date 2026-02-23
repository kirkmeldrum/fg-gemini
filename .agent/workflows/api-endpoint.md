---
description: Generate a complete API endpoint with repository, service, route, types, validation, and docs
---

# API Endpoint Generator

## Pre-Checks

1. Read existing routes in `packages/api/src/routes/` to match patterns
2. Check `packages/shared/src/types/index.ts` for reusable interfaces
3. Verify the database table exists in `database/ddl/v1.0_full_ddl.sql`
4. Check `docs/API.md` to avoid duplicating endpoints
5. Read the relevant REQ-XXX from `docs/REQUIREMENTS.md`

## File Generation Order

Create/modify files in this exact order:

1. `packages/shared/src/types/index.ts` — Add TypeScript interfaces
2. `packages/shared/src/validation/index.ts` — Add Zod schemas
3. `packages/api/src/repositories/[domain]Repo.ts` — Knex data access
4. `packages/api/src/services/[domain]Service.ts` — Business logic
5. `packages/api/src/routes/[domain].ts` — Express route handler
6. `packages/api/src/routes/index.ts` — Mount the route
7. `docs/API.md` — Update documentation

## Patterns

### Repository
- Use Knex.js for ALL queries (no raw SQL)
- Return plain objects, never Knex query builders
- snake_case for DB columns, camelCase for JS/TS
- Implement soft delete (is_deleted flag)

### Service
- ALL business logic lives here
- Validate inputs with Zod at service boundary
- Throw typed errors: NotFoundError, ValidationError, ForbiddenError
- Format DB rows into API response shapes

### Route Handler
- HTTP concerns ONLY (parse request, format response, status code)
- NO business logic in routes
- Use try/catch with next(err)
- Apply auth middleware: requireAuth, requireRole('admin')

### Response Envelope
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 20, "total": 150 } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { ... } } }
```

### Error Codes
| Code | HTTP | When |
|------|------|------|
| VALIDATION_ERROR | 400 | Zod failed |
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Insufficient role |
| NOT_FOUND | 404 | Resource missing |
| CONFLICT | 409 | Duplicate |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unexpected |
