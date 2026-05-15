CREATE TABLE telegram_subscribers (
    chat_id    BIGINT PRIMARY KEY,
    username   TEXT,
    first_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);