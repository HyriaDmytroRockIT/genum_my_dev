# Genum

An open-source platform for managing and testing AI prompts with support for multiple LLM providers.

## Overview

Genum is a full-stack application that provides:
- **Backend API** (`apps/core`): Node.js/Express server with TypeScript, Prisma ORM, and AI provider integrations
- **Frontend Web App** (`apps/web`): React application built with Vite and TypeScript
- **Database Stack**: PostgreSQL for primary data storage and ClickHouse for analytics

## Prerequisites

- **Docker**
- **Docker Compose**
- At least 4GB of available RAM
- 8GB of free disk space

## Quick Start

1. **Clone the repository**
   ```bash
   git clone ...
   cd ...
   ```

2. **Create environment file** (optional)

   Create a `.env` file in the root directory. For the Docker setup, **you only need to add AI provider keys** to use AI features — everything else has defaults in `docker-compose*.yml`.

   Minimal `.env` file (only AI keys needed):
   ```env
   # AI Provider Keys (required for AI features)
   OPENAI_KEY=your_openai_key_here
   ANTHROPIC_KEY=your_anthropic_key_here
   GEMINI_KEY=your_gemini_key_here
   ```

   Tip: start from `env.example` (copy it to `.env`).

   You can add any of these keys depending on which AI providers you want to use. The application will work without them, but AI features won't be available.

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

   This command will:
   - Build Docker images for all services
   - Start PostgreSQL and ClickHouse databases
   - Run database migrations and seed initial data
   - Start the backend API server
   - Start the frontend web application

4. **Access the application**
   - Frontend: http://localhost:3080
   - Backend API: http://localhost:3010
   - PostgreSQL: localhost:5432 (if exposed)
   - ClickHouse HTTP: localhost:8123 (if exposed)

## Services

The application consists of the following services:

### `core` - Backend API
- **Port**: 3010 (configurable via `CORE_PORT`)
- **Description**: Express.js API server handling business logic, database operations, and AI provider integrations
- **Health**: Automatically runs database migrations and seeds on startup

### `web` - Frontend Application
- **Port**: 3080 (configurable via `WEB_PORT`)
- **Description**: React single-page application served via Nginx
- **Note**: Environment variables are embedded at build time

### `postgres` - PostgreSQL Database
- **Port**: 5432 (configurable via `POSTGRES_PORT`, defaults to localhost-only)
- **Version**: PostgreSQL 17
- **Data Persistence**: Stored in Docker volume `genum-postgres_data`

### `clickhouse` - ClickHouse Database
- **HTTP Port**: 8123 (configurable via `CLICKHOUSE_HTTP_PORT`, defaults to localhost-only)
- **Native Port**: 9000 (configurable via `CLICKHOUSE_NATIVE_PORT`, defaults to localhost-only)
- **Version**: ClickHouse 25.10
- **Data Persistence**: Stored in Docker volumes `genum-clickhouse_data` and `genum-clickhouse_logs`

## Environment Variables

### AI Provider Keys (Only Required Variables)
To use AI features, you need to add **only these 3 environment variables** to your `.env` file:
- `OPENAI_KEY`: OpenAI API key for GPT models
- `ANTHROPIC_KEY`: Anthropic API key for Claude models
- `GEMINI_KEY`: Google API key for Gemini models

You can add any combination of these keys depending on which AI providers you want to use. The application will work without them, but AI features won't be available.

### All Other Variables (Optional)
All other environment variables have defaults suitable for local development. You only need to set them if you want to customize the configuration.

### Authentication
- `INSTANCE_TYPE`: Set to `local` for local authentication or `cloud` for Auth0
- `AUTH0_DOMAIN`: Auth0 domain (required for cloud mode)
- `AUTH0_CLIENT_ID`: Auth0 client ID (required for cloud mode)
- `AUTH0_AUDIENCE`: Auth0 API audience (required for cloud mode)

### Port Configuration
- `CORE_PORT`: Backend API port (default: 3010)
- `WEB_PORT`: Frontend web port (default: 3080)
- `POSTGRES_PORT`: PostgreSQL port (default: 127.0.0.1:5432)
- `CLICKHOUSE_HTTP_PORT`: ClickHouse HTTP port (default: 127.0.0.1:8123)
- `CLICKHOUSE_NATIVE_PORT`: ClickHouse native port (default: 127.0.0.1:9000)

See `docker-compose.yml` for the complete list of environment variables.

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f core
docker-compose logs -f web
```

### Rebuild and restart
```bash
docker-compose up -d --build
```

### Remove all data (⚠️ destructive)
```bash
docker-compose down -v
```

## Troubleshooting

### Services won't start
1. Check if ports are already in use:
   ```bash
   lsof -i :3010  # Backend
   lsof -i :3080  # Frontend
   lsof -i :5432  # PostgreSQL
   ```

2. Check Docker logs:
   ```bash
   docker-compose logs
   ```

### Frontend can't connect to backend
- Verify `API_URL` build argument matches your backend URL
- Check network connectivity: `docker network inspect genum_genum-network`

### Reset everything
```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove images (optional)
docker rmi genum-core genum-web

# Start fresh
docker-compose up -d --build
```

## Development

For local development without Docker, see the individual README files in:
- `apps/core/` - Backend development setup
- `apps/web/` - Frontend development setup

## License

Genum is [distributed under the **Business Source License 1.1 (BUSL)**](/LICENSE.md).

### Allowed
- ✔ Personal use
- ✔ Educational use
- ✔ Research and experimentation

### Requires a Commercial License
- ❌ Any commercial use
- ❌ Use inside a business or organization
- ❌ Internal business automation
- ❌ Enterprise deployment
- ❌ Integration into SaaS, services, or commercial tools

Genum is **source-available**, not open-source.
There is **no automatic conversion** to an open-source license.

### FAQ

#### ❓ Can I use genum at home?
Yes. Personal use is fully allowed.

#### ❓ Can I use genum for study or research?
Yes. Educational and research usage is permitted.

#### ❓ Can I modify or fork the code?
Yes, as long as usage remains non-commercial.

#### ❓ Can I use genum inside a company?
No. Any organizational or business usage requires a commercial license.

#### ❓ Can I integrate genum into my SaaS or service?
No — unless you hold a commercial license from rockIT.consulting GmbH.

#### ❓ Is genum open-source?
No. It is **source-available** under BUSL 1.1.

#### ❓ Will genum become open-source?
No. There is no scheduled transition to an open-source license.

#### ❓ How do I obtain a commercial license?
Contact: enterprise@rockit.consulting


## Contributing

Coming soon...
