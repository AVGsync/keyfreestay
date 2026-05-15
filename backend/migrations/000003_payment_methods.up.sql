CREATE TYPE card_brand AS ENUM ('visa', 'mastercard', 'mir', 'unionpay', 'other');

CREATE TABLE payment_methods (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_last4       CHAR(4) NOT NULL CHECK (card_last4 ~ '^[0-9]{4}$'),
    card_brand       card_brand NOT NULL,
    expiry_month     SMALLINT NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year      SMALLINT NOT NULL CHECK (expiry_year BETWEEN 2024 AND 2099),
    cardholder_name  TEXT NOT NULL,
    is_default       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX payment_methods_user_id_idx ON payment_methods (user_id);

CREATE UNIQUE INDEX payment_methods_one_default_per_user
    ON payment_methods (user_id)
    WHERE is_default = TRUE;

CREATE TRIGGER payment_methods_set_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();