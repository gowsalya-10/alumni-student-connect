# Alumni Impact Hub — API Contract (Step 0)

Agree on this before writing backend code. Every FastAPI router in the project
follows these rules so the three backends merge into one app with zero
renaming.

## Base URL & versioning
```
/api/v1/...
```
All routes are prefixed `/api/v1`. Each teammate's router is mounted under
their own sub-path (below) so there's no collision risk even if merging is
rushed.

## Auth
- JWT in `Authorization: Bearer <token>` header.
- Login/register issue `{ access_token, token_type: "bearer", role }`.
- Every protected route depends on a shared `get_current_user()` dependency
  that decodes the JWT and returns `{ id, email, role }`.
- Role guards: `require_role("student")`, `require_role("alumni")`,
  `require_role("admin")` — reuse one shared dependency, don't write your own
  per feature.

## Response envelope
Every endpoint returns:
```json
{ "data": { ... } | [ ... ] | null, "error": null | { "code": "string", "message": "string" } }
```
- Success: `error` is `null`, `data` holds the payload.
- Failure: `data` is `null`, `error.code` is a short machine string
  (`"NOT_FOUND"`, `"VALIDATION_ERROR"`, `"FORBIDDEN"`), `error.message` is
  human-readable.
- Paginated lists: `data` is `{ items: [...], total, page, page_size }`.

## Route ownership (mount points)

| Prefix | Owner | Covers |
|---|---|---|
| `/api/v1/auth` | shared (build together) | register, login, refresh, me |
| `/api/v1/students` | Person A | profile, onboarding, roadmap, skill-gap, resume |
| `/api/v1/skills` | Person A | skill catalog (read-only, shared reference data) |
| `/api/v1/alumni` | Person B | alumni profile, discovery/search, matching |
| `/api/v1/connections` | Person B | connection requests |
| `/api/v1/messages` | Person B | conversations, messages, attachments |
| `/api/v1/questions` | Person B | Ask Alumni Q&A |
| `/api/v1/mentorship` | Person C | requests, sessions, ratings |
| `/api/v1/opportunities` | Person C | CRUD + matching + applications |
| `/api/v1/impact` | Person C | impact scores, activities |
| `/api/v1/rewards` | Person C | wallet, transactions, redemptions, badges |
| `/api/v1/admin` | Person C | verification queue, analytics, reward config |
| `/api/v1/notifications` | Person C (schema), all (writes) | notification center |

Only touch another prefix's router file if you tell the owner first — the
underlying tables are shared (see `schema.sql`), but route handlers are not.

## ID conventions
- All primary keys are UUIDs (`gen_random_uuid()`), passed/returned as strings.
- Never expose auto-increment integer IDs from `skills`/`badges` as the only
  identifier in a public response if a UUID entity references them — join and
  return the name too, so frontend code never has to guess.

## AI-feature endpoints (stub-then-swap pattern)
Every AI-powered endpoint (roadmap generation, skill gap, alumni matching,
opportunity matching, resume health score) should be a single function like:

```python
def generate_roadmap(student_profile: dict) -> dict:
    # v1: rule-based / templated stub so the frontend has real shapes to build against
    # v2: swap internals for an LLM call — the function signature and return
    #     shape must not change, so nobody else's code breaks.
    ...
```

Agree on the **output JSON shape** for each of these five functions in your
first standup, even before the internals are real. That shape is what
unblocks frontend work in parallel with AI work.

## Notifications contract
Any router can create a notification by inserting into `notifications`
(owned by Person C, but writable by everyone):
```json
{
  "user_id": "uuid",
  "type": "connection_request | mentorship_accepted | reward_earned | ...",
  "title": "string",
  "body": "string",
  "related_id": "uuid | null"
}
```
Person C exposes a shared helper (`create_notification(...)`) — import it,
don't hand-write inserts.
