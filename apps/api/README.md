# Cognify Academy

## Developers

Docs aavailable on `http://localhost:3000/api/v1/swagger`.

### Installation and Running

For local development run the `docker-compose.yml` file to spin up Postgresql.

Then install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

Testing:

```bash
bun test
```

### Database Migration

We use Prisma. To migrate:

```bash
npx prisma migrate dev --name init
```

Then each change:

```bash
npx prisma migrate dev --name describeyourchange
```

View the database with `npx prisma studio --port 5555`

### Routing

We use [Elysia JS](https://elysiajs.com/) for routing.
