# Shopping Cart Demo

A demo shopping cart backend built on a Node.js stack.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (Prisma ORM)

## Planned Features

Tracked as GitHub issues:

1. Backend scaffold (Node.js + Express + PostgreSQL)
2. Product catalog management (CRUD API)
3. Cart management (add / update / remove / view)
4. User authentication & accounts
5. Inventory / stock management
6. Checkout & order placement
7. Order history & tracking
8. Payment integration (mock/stub provider)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a reachable instance)

### Setup

```bash
cp .env.example .env
# Edit DATABASE_URL in .env if needed

npm install
npx prisma migrate deploy
npm run dev
```

### Health check

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

### Docker

```bash
docker build -t shopping-cart-demo .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/shopping_cart_demo?schema=public" \
  shopping-cart-demo
```

CI builds this image on pushes/PRs and polls `GET /health` against a Postgres service container.

### Products API

| Method   | Path            | Description                                                       |
| -------- | --------------- | ----------------------------------------------------------------- |
| `GET`    | `/products`     | List products (`page`, `limit`, `search`, `minPrice`, `maxPrice`) |
| `GET`    | `/products/:id` | Get one product                                                   |
| `POST`   | `/products`     | Create product (`201`)                                            |
| `PUT`    | `/products/:id` | Update product                                                    |
| `DELETE` | `/products/:id` | Delete product (`204`)                                            |

### Cart API

| Method   | Path              | Description                                         |
| -------- | ----------------- | --------------------------------------------------- |
| `GET`    | `/cart`           | Return the cart with line items and computed totals |
| `POST`   | `/cart/items`     | Add a product (`{ productId, quantity }`)           |
| `PUT`    | `/cart/items/:id` | Update a line item's quantity                       |
| `DELETE` | `/cart/items/:id` | Remove a line item                                  |
| `DELETE` | `/cart`           | Clear all items from the cart                       |

### Scripts

| Script                    | Description                   |
| ------------------------- | ----------------------------- |
| `npm run dev`             | Start with nodemon            |
| `npm start`               | Start production server       |
| `npm run lint`            | Run ESLint                    |
| `npm run format`          | Format with Prettier          |
| `npm run prisma:migrate`  | Create/apply migrations (dev) |
| `npm run prisma:generate` | Regenerate Prisma Client      |
