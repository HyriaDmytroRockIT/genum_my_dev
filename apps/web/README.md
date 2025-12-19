# Genum Web (`apps/web`)

Frontend React app (Vite + TypeScript).

## Run (recommended)

Use the root `docker-compose.yml` flow described in `README.md`.

## Local development (without Docker)

1. Install dependencies (from repo root):
   ```bash
   pnpm install
   ```

2. Start the web app:
   ```bash
   pnpm --filter web dev
   ```

3. Make sure the backend API is reachable (default `http://localhost:3010`).

## Runtime config

The web app reads runtime variables from `public/env.template.js` (in Docker/Nginx flow) and uses:
- `API_URL`
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_AUDIENCE` (cloud mode)
- `SENTRY_ENABLED`, `SENTRY_DSN`, `SENTRY_ENVIRONMENT`

