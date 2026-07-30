# Engineering Guidelines

General conventions for this codebase. CodeRabbit ingests this file as a code
guideline (see `.coderabbit.yaml`) and enforces it on every pull request. Each
rule has a stable ID (e.g. `EG-03`); when a review flags a violation it should
cite the ID.

These are *policy and judgment* rules that complement the mechanical style rules
in `.coderabbit.yaml` path instructions — they describe intent and conventions a
linter can't infer.

## Architecture & layering

### EG-01 — Respect the layer boundaries
Controllers parse requests and delegate; **services** own business logic and all
Prisma access; **middleware** handles cross-cutting concerns. A controller must
not contain Prisma queries, and a service must not touch the Express
`req`/`res`. Flag any layer that reaches across these boundaries.

### EG-02 — One shared Prisma client
Database access goes through the single shared client in `src/db`. Flag any file
that constructs its own `new PrismaClient()`.

### EG-03 — Errors flow through `createHttpError` + `next(err)`
Throw domain failures with `createHttpError(status, message)` and forward them
with `next(err)`. Do not build ad-hoc error responses inside controllers or
services, and do not swallow errors silently.

## Observability

### EG-04 — Use the app logger, not `console.*`
Application code must log through the project's logging setup (e.g. `morgan` for
HTTP, a structured logger for app events). Ad-hoc `console.log`/`console.error`
in request paths should be flagged. (Personal data in logs is separately
prohibited — see `DATA_PROTECTION.md` DP-02.)

## Change hygiene

### EG-05 — Document new HTTP endpoints
Every new or changed HTTP route must be reflected in the README API table (and
any OpenAPI/Postman collection the repo maintains). A PR that adds a route
without updating the API documentation must be flagged — reviewers should not
have to read the router to discover the surface area.

### EG-06 — New behavior ships with tests
A PR that adds a service function or endpoint should add or update tests
covering it. Flag new business logic that arrives with no corresponding test.

### EG-07 — Configuration via `src/config`, no inline env reads
Read `process.env` only in the config layer, validate required values up front,
and consume the exported config object elsewhere. Flag `process.env` access or
hardcoded hosts/URLs outside `src/config`.
