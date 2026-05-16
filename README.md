# KeyFreeStay

KeyFreeStay - сервис краткосрочной аренды жилья с бесконтактным заселением.

API покрывает регистрацию и вход пользователей, профиль, объекты жилья, загрузку изображений, бронирования, платёжные методы и публичные контактные заявки с отправкой в Telegram.

## Возможности

- Регистрация и вход по email/password.
- Авторизация через JWT в HttpOnly cookie `token`.
- Получение и обновление профиля текущего пользователя.
- CRUD для объектов жилья.
- Загрузка и удаление изображений жилья через S3-compatible хранилище MinIO.
- Список опубликованных объектов для гостей и список своих объектов для владельца.
- Создание, просмотр, список и удаление бронирований.
- Добавление, список и удаление платёжных методов.
- Публичная контактная форма с отправкой заявки подписчикам Telegram-бота.
- Swagger UI в debug-режиме.

## Стек

- Go 1.26
- chi router
- PostgreSQL 16
- MinIO / S3-compatible storage
- Telegram Bot API
- swaggo Swagger
- Docker Compose

## Структура

```text
.
├── backend
│   ├── cmd/apiserver          # entrypoint API-сервера
│   ├── docs                   # generated Swagger docs
│   ├── internal/app           # запуск, конфиг, router
│   ├── internal/infrastructure# JWT, password hashing, Telegram
│   ├── internal/model         # request/response/domain модели
│   ├── internal/repository    # PostgreSQL и MinIO
│   ├── internal/service       # бизнес-логика
│   ├── internal/transport     # HTTP handlers/middleware
│   └── migrations             # SQL migrations
├── docker-compose.yaml
└── README.md
```

## Переменные окружения

Создайте `.env` в корне проекта. Не коммитьте реальные секреты.

```env
BIND_ADDR=8080
DEBUG=true
LOG_LEVEL=debug

JWT_SECRET=change_me
TTL_ACCESS_TOKEN=3600

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=keyfreestay
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
ENDPOINT=localhost:9000
PUBLIC_URL=http://localhost:9000
USE_SSL=false

TG_BOT_TOKEN=
```

Важно:

- `BIND_ADDR` задавайте без двоеточия: `8080`, не `:8080`.
- `TTL_ACCESS_TOKEN` задавайте числом без комментариев в этой же строке.
- `TG_BOT_TOKEN` нужен для Telegram-заявок. Без валидного токена отправка в Telegram не работает.

## Запуск локально

Поднять PostgreSQL и MinIO:

```bash
docker compose up -d postgres minio
```

Применить миграции через Docker:

```bash
docker compose run --rm postgres-migrate \
  -path=/migrations \
  -database "postgres://postgres:postgres@postgres:5432/keyfreestay?sslmode=disable" \
  up
```

Запустить API:

```bash
cd backend
go run ./cmd/apiserver
```

Проверка:

```bash
curl http://localhost:8080/api/ping
```

Ожидаемый ответ:

```text
pong
```

## Swagger

Swagger UI доступен только при `DEBUG=true`:

```text
http://localhost:8080/swagger/index.html
```

JSON спецификация:

```text
http://localhost:8080/swagger/doc.json
```

Перегенерировать Swagger через Go:

```bash
cd backend
go run github.com/swaggo/swag/cmd/swag@v1.16.6 init \
  -g cmd/apiserver/main.go \
  -o docs \
  --parseDependency \
  --parseInternal
```

Перегенерировать Swagger через Docker:

```bash
docker compose --profile swagger run --rm swagger init \
  -g cmd/apiserver/main.go \
  -o docs \
  --parseDependency \
  --parseInternal
```

## API

Base path:

```text
/api
```

Публичные маршруты:

| Method | Path | Назначение |
| --- | --- | --- |
| GET | `/ping` | healthcheck HTTP-сервера |
| POST | `/contact` | отправить контактную заявку |
| POST | `/auth/register` | зарегистрировать пользователя |
| POST | `/auth/login` | войти и получить cookie `token` |

Защищённые маршруты требуют cookie `token`:

| Method | Path | Назначение |
| --- | --- | --- |
| GET | `/me` | профиль текущего пользователя |
| PATCH | `/me` | обновить профиль |
| GET | `/housing` | список объектов жилья |
| GET | `/housing/{id}` | объект жилья по ID |
| POST | `/housing` | создать объект жилья |
| PATCH | `/housing?id={id}` | обновить объект жилья |
| DELETE | `/housing?id={id}` | удалить объект жилья |
| POST | `/housing/{id}/images` | загрузить изображения |
| DELETE | `/housing/{id}/images?key={key}` | удалить изображение |
| GET | `/booking` | список бронирований |
| GET | `/booking/{id}` | бронирование по ID |
| PUT | `/booking/create` | создать бронирование |
| DELETE | `/booking/{id}` | удалить бронирование |
| GET | `/payments` | список платёжных методов |
| PUT | `/payments/create` | добавить платёжный метод |
| DELETE | `/payments/{id}` | удалить платёжный метод |

## Авторизация

Вход:

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ivan.petrov@example.com","password":"Str0ngPass!2026"}'
```

При успехе сервер ставит cookie:

```text
Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

Для защищённых запросов передавайте cookie:

```bash
curl http://localhost:8080/api/me \
  -H "Cookie: token=<jwt>"
```

## Миграции

Миграции лежат в `backend/migrations`.

Применить:

```bash
migrate -path backend/migrations \
  -database "postgres://postgres:postgres@localhost:5432/keyfreestay?sslmode=disable" \
  up
```

Откатить одну миграцию:

```bash
migrate -path backend/migrations \
  -database "postgres://postgres:postgres@localhost:5432/keyfreestay?sslmode=disable" \
  down 1
```

## Тесты и проверки

```bash
cd backend
go test ./...
go vet ./...
```

## Docker build

Собрать backend image:

```bash
docker build -t keyfreestay-backend ./backend
```

Запустить контейнер можно после поднятия PostgreSQL и MinIO, передав переменные окружения из `.env`.

