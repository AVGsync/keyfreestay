package postgres

import (
	"context"
	"fmt"

	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
)

type PaymentMethodRepository struct {
	database *DB
}

func (r *PaymentMethodRepository) CreatePaymentMethod(payment *request.CreatePaymentMethodRequest, userID string, ctx context.Context) (response.PaymentMethodResponse, error) {
	var p response.PaymentMethodResponse

	// если новая карта is_default=true — сначала сбрасываем флаг у старых, чтобы не упереться в UNIQUE-индекс
	if payment.IsDefault {
		_, err := r.database.db.ExecContext(ctx, `
			UPDATE payment_methods
			SET is_default = FALSE
			WHERE user_id = $1 AND is_default = TRUE
		`, userID)
		if err != nil {
			return response.PaymentMethodResponse{}, fmt.Errorf("payment repository: clear default: %w", err)
		}
	}

	err := r.database.db.QueryRowContext(ctx, `
		INSERT INTO payment_methods (
			user_id, card_last4, card_brand, expiry_month, expiry_year, cardholder_name, is_default
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, card_last4, card_brand, expiry_month, expiry_year, cardholder_name, is_default, created_at
	`,
		userID,
		payment.CardLast4,
		payment.CardBrand,
		payment.ExpiryMonth,
		payment.ExpiryYear,
		payment.CardholderName,
		payment.IsDefault,
	).Scan(
		&p.ID,
		&p.CardLast4,
		&p.CardBrand,
		&p.ExpiryMonth,
		&p.ExpiryYear,
		&p.CardholderName,
		&p.IsDefault,
		&p.CreatedAt,
	)
	if err != nil {
		return response.PaymentMethodResponse{}, fmt.Errorf("payment repository: create payment method: %w", err)
	}
	return p, nil
}

func (r *PaymentMethodRepository) GetPaymentMethodListByUser(userID string, ctx context.Context) (response.PaymentMethodListResponse, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT id, card_last4, card_brand, expiry_month, expiry_year, cardholder_name, is_default, created_at
		FROM payment_methods
		WHERE user_id = $1
		ORDER BY is_default DESC, created_at DESC
	`, userID)
	if err != nil {
		return response.PaymentMethodListResponse{}, fmt.Errorf("payment repository: get list by user: %w", err)
	}
	defer rows.Close()

	var items []response.PaymentMethodResponse
	for rows.Next() {
		var p response.PaymentMethodResponse
		err := rows.Scan(
			&p.ID,
			&p.CardLast4,
			&p.CardBrand,
			&p.ExpiryMonth,
			&p.ExpiryYear,
			&p.CardholderName,
			&p.IsDefault,
			&p.CreatedAt,
		)
		if err != nil {
			return response.PaymentMethodListResponse{}, fmt.Errorf("payment repository: scan payment item: %w", err)
		}
		items = append(items, p)
	}
	if err := rows.Err(); err != nil {
		return response.PaymentMethodListResponse{}, fmt.Errorf("payment repository: iterate rows: %w", err)
	}

	return response.PaymentMethodListResponse{
		Items: items,
		Total: len(items),
	}, nil
}

func (r *PaymentMethodRepository) DeletePaymentMethod(paymentID string, userID string, ctx context.Context) error {
	_, err := r.database.db.ExecContext(ctx, `
		DELETE FROM payment_methods
		WHERE id = $1 AND user_id = $2
	`, paymentID, userID)
	if err != nil {
		return fmt.Errorf("payment repository: delete payment method: %w", err)
	}
	return nil
}