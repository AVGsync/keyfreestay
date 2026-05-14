CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE bookings (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    housing_id               UUID NOT NULL REFERENCES housing(id) ON DELETE RESTRICT,
    check_in                 DATE NOT NULL,
    check_out                DATE NOT NULL,
    guests_count             SMALLINT NOT NULL CHECK (guests_count > 0),

    -- Снэпшоты на момент брони — чтобы чек не плыл при изменении цены жилья
    price_per_night_snapshot NUMERIC(10, 2) NOT NULL CHECK (price_per_night_snapshot > 0),
    service_fee              NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
    total_price              NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),

    status                   booking_status NOT NULL DEFAULT 'pending',
    payment_method_id        UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT bookings_dates_valid CHECK (check_out > check_in),

    -- БД не даст пересечь активные брони на одно жильё
    CONSTRAINT bookings_no_overlap
        EXCLUDE USING gist (
            housing_id WITH =,
            daterange(check_in, check_out, '[)') WITH &&
        ) WHERE (status IN ('pending', 'confirmed'))
);

CREATE INDEX bookings_user_status_idx
    ON bookings (user_id, status, check_in DESC);

CREATE INDEX bookings_housing_dates_idx
    ON bookings (housing_id, check_in, check_out)
    WHERE status IN ('pending', 'confirmed');

CREATE TRIGGER bookings_set_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();