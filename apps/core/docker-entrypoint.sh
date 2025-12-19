#!/bin/sh
set -e

# Apply migrations and seed before starting the server
pnpm run db-init

exec "$@"

