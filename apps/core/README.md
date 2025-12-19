# Genum Core (`apps/core`)

Backend API server (Express + TypeScript + Prisma).

## Run (recommended)

Use the root `docker-compose.yml` flow described in the repo `README.md`.

## Local development (without Docker)

1. Install dependencies (from repo root):
   ```bash
   pnpm install
   ```

2. Start infra (Postgres + ClickHouse):
   ```bash
   pnpm dev:infra:up
   ```

3. Create a root `.env` (see `env.example`).

   Note: unlike the Docker setup, local `core` dev requires database URLs and other variables to be present because they are validated in `src/env.ts`.

4. Start the API:
   ```bash
   pnpm --filter core dev
   ```

The API defaults to `http://localhost:3010`.

## Database & migrations

- Generate Prisma client:
  ```bash
  pnpm --filter core db:generate
  ```
- Local migration + seed:
  ```bash
  pnpm --filter core dev:db-init
  ```


