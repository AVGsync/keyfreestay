package postgres

import (
	"context"
	"fmt"
)

type TgSubscriberRepository struct {
	database *DB
}

func (r *TgSubscriberRepository) Add(chatID int64, username, firstName string, ctx context.Context) error {
	_, err := r.database.db.ExecContext(ctx, `
		INSERT INTO telegram_subscribers (chat_id, username, first_name)
		VALUES ($1, $2, $3)
		ON CONFLICT (chat_id) DO UPDATE
		SET username = EXCLUDED.username,
		    first_name = EXCLUDED.first_name
	`, chatID, username, firstName)
	if err != nil {
		return fmt.Errorf("tg subscriber repository: add: %w", err)
	}
	return nil
}

func (r *TgSubscriberRepository) Delete(chatID int64, ctx context.Context) error {
	_, err := r.database.db.ExecContext(ctx, `
		DELETE FROM telegram_subscribers WHERE chat_id = $1
	`, chatID)
	if err != nil {
		return fmt.Errorf("tg subscriber repository: delete: %w", err)
	}
	return nil
}

func (r *TgSubscriberRepository) GetAll(ctx context.Context) ([]int64, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT chat_id FROM telegram_subscribers
	`)
	if err != nil {
		return nil, fmt.Errorf("tg subscriber repository: get all: %w", err)
	}
	defer rows.Close()

	var ids []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("tg subscriber repository: scan: %w", err)
		}
		ids = append(ids, id)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("tg subscriber repository: iterate: %w", err)
	}
	return ids, nil
}