CREATE TYPE housing_type AS ENUM ('apartment', 'house', 'office');
CREATE TYPE housing_status AS ENUM ('draft', 'published', 'unpublished');
CREATE TYPE cancellation_policy AS ENUM ('flexible', 'moderate', 'strict');

CREATE TABLE housing (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    housing_type         housing_type NOT NULL DEFAULT 'apartment',
    status               housing_status NOT NULL DEFAULT 'draft',

    -- nullable: черновик может быть недозаполнен
    title                TEXT,
    description          TEXT,
    address              TEXT,
    latitude             DOUBLE PRECISION,
    longitude            DOUBLE PRECISION,
    price_per_night      NUMERIC(10, 2) CHECK (price_per_night IS NULL OR price_per_night > 0),
    max_guests           SMALLINT CHECK (max_guests IS NULL OR max_guests > 0),

    amenities            TEXT[] NOT NULL DEFAULT '{}',
    cancellation_policy  cancellation_policy NOT NULL DEFAULT 'flexible',

    rating_avg           NUMERIC(2, 1) CHECK (rating_avg IS NULL OR rating_avg BETWEEN 0 AND 5),
    rating_count         INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),

    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Опубликовать можно только полностью заполненный объект.
    -- БД сама не даст выставить status='published' с null'ами.
    CONSTRAINT housing_published_required_fields CHECK (
        status != 'published' OR (
            title IS NOT NULL
            AND address IS NOT NULL
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND price_per_night IS NOT NULL
            AND max_guests IS NOT NULL
        )
    )
);

-- Главная: показываем только опубликованные, сортируем по цене
CREATE INDEX housing_published_price_idx
    ON housing (price_per_night)
    WHERE status = 'published';

-- Карта (bounding box по координатам, только опубликованные)
CREATE INDEX housing_geo_idx
    ON housing (latitude, longitude)
    WHERE status = 'published';

-- Фильтр по удобствам: amenities @> ARRAY['wifi','smart_lock']
CREATE INDEX housing_amenities_gin_idx ON housing USING GIN (amenities);

-- "Мои объекты" — все объекты пользователя
CREATE INDEX housing_user_id_idx ON housing (user_id, created_at DESC);

CREATE TRIGGER housing_set_updated_at
    BEFORE UPDATE ON housing
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Фото — отдельная таблица с порядком
CREATE TABLE housing_images (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id   UUID NOT NULL REFERENCES housing(id) ON DELETE CASCADE,
    storage_key  TEXT NOT NULL,        -- ключ в S3/MinIO, НЕ полный URL
    position     SMALLINT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX housing_images_housing_id_idx ON housing_images (housing_id, position);