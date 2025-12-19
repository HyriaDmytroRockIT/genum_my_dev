# Docker Build Instructions

## Структура

Dockerfile для каждого приложения находится в его директории:
- `apps/core/Dockerfile` - Backend API сервер
- `apps/web/Dockerfile` - Frontend React приложение

## Настройка переменных окружения

### 1. Создайте `.env` файл в корне проекта

```bash
cp .env.example .env
```

Отредактируйте `.env` файл и укажите необходимые переменные окружения.

### 2. Использование с Docker Compose (Рекомендуется)

Docker Compose автоматически загружает переменные из `.env` файла в корне проекта.

#### Production сборка и запуск:

```bash
docker-compose up -d --build
```

#### Development режим:

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

#### Остановка:

```bash
docker-compose down
# или для dev
docker-compose -f docker-compose.dev.yml down
```

#### Просмотр логов:

```bash
docker-compose logs -f core
docker-compose logs -f web
```

## Ручная сборка образов (без docker-compose)

### Core (Backend)

```bash
cd apps/core
docker build -t genum-core:latest .
```

Или из корня проекта:

```bash
docker build -t genum-core:latest -f apps/core/Dockerfile apps/core
```

### Web (Frontend)

```bash
cd apps/web
docker build -t genum-web:latest .
```

Или из корня проекта:

```bash
docker build -t genum-web:latest -f apps/web/Dockerfile apps/web
```

## Запуск контейнеров вручную

### Core

```bash
docker run -p 3010:3010 \
  --env-file ../.env \
  -e NODE_ENV=production \
  genum-core:latest
```

### Web

```bash
docker run -p 80:80 \
  --env-file ../.env \
  genum-web:latest
```

## Важные замечания

1. **`.env` файл** должен находиться в корне проекта (рядом с `docker-compose.yml`)
2. **Не коммитьте** `.env` файл в git (он уже в `.gitignore`)
3. Используйте `.env.example` как шаблон для создания своего `.env`

### Переменные окружения для Web (Vite)

**ВАЖНО**: Vite требует префикс `VITE_` для переменных, доступных в клиентском коде.

- **Build-time переменные**: Переменные с префиксом `VITE_` встраиваются в код **во время сборки** (build time)
- Эти переменные передаются через `build.args` в docker-compose.yml
- После сборки статическое приложение не может изменить эти переменные в runtime
- Пример: `VITE_API_URL=http://localhost:3010`

### Переменные окружения для Core (Node.js)

- **Runtime переменные**: Переменные загружаются из `.env` через `env_file` в runtime
- Могут быть изменены без пересборки образа
- Пример: `DATABASE_URL`, `STAGE`, `PORT`

### Переопределение переменных

Переменные можно переопределить через `environment` секцию в docker-compose.yml или через `build.args` для build-time переменных.

