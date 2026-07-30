# API Design Guidelines

Conventions for the HTTP API. CodeRabbit ingests this file as a code guideline
(see `.coderabbit.yaml`) and enforces it on every pull request. Each rule has a
stable ID (e.g. `API-04`); cite the ID when flagging a violation.

## Resource naming & structure

### API-01 — Plural noun resources
Collections use plural nouns (`/products`, `/carts`, `/customers`). Actions are
expressed with HTTP verbs, not verbs in the path (no `/getCustomer`,
`/createOrder`). Flag verb-in-path routes.

### API-02 — Correct status codes
Use `201` for resource creation, `200` for successful reads/updates, `204` for
successful deletes with no body, `400` for validation errors, `401`/`403` for
auth failures, `404` for missing resources, `409` for conflicts. Flag handlers
that return the wrong class of code (e.g. `200` on create).

## Payloads

### API-03 — Consistent error envelope
Error responses use the shape `{ "error": "<message>" }` produced by the central
error handler. Flag handlers that return a different error shape or format
errors inline.

### API-04 — Return DTOs, never raw ORM records
Responses must return an explicit, whitelisted DTO — never a raw Prisma model
object spread directly into the response. This prevents accidental exposure of
new columns and keeps the contract stable. Flag `res.json(prismaRecord)` on a
model fetched from the database.

### API-05 — Validate input at the edge
Every write endpoint validates its request body/params via validation
middleware before the controller runs. Flag handlers that read `req.body` or
`req.params` without an upstream validator.

## Collections

### API-06 — Paginate list endpoints
Any endpoint returning a collection must support pagination (`page`, `limit`)
with a sane default limit, and must not return unbounded result sets. Flag new
list endpoints that return everything.

## Compatibility

### API-07 — No silent breaking changes
Renaming or removing a response field, changing a status code, or changing a
request contract is a breaking change. It must be called out in the PR
description and coordinated with known consumers (e.g. the frontend). Flag
contract changes that aren't documented.
