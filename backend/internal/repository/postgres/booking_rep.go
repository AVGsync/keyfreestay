package postgres

import (
	"context"
	"fmt"

	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
)

type BookingRepository struct {
	database *DB
}

func (r *BookingRepository) CreateBooking(booking *request.CreateBookingRequest, userID string, ctx context.Context) (response.BookingResponse, error) {
	var b response.BookingResponse

	err := r.database.db.QueryRowContext(ctx, `
		INSERT INTO bookings (
			user_id, housing_id, check_in, check_out, guests_count,
			price_per_night_snapshot, service_fee, total_price, payment_method_id
		)
		SELECT $1, h.id, $3::date, $4::date, $5,
		       h.price_per_night,
		       500,
		       h.price_per_night * ($4::date - $3::date) + 500,
		       $6
		FROM housing h
		WHERE h.id = $2
		  AND h.status = 'published'
		  AND h.max_guests >= $5
		RETURNING id, housing_id, check_in, check_out, guests_count,
		          price_per_night_snapshot, service_fee, total_price,
		          status, payment_method_id, created_at
	`,
		userID,
		booking.HousingID,
		booking.CheckIn,
		booking.CheckOut,
		booking.GuestsCount,
		booking.PaymentMethodID,
	).Scan(
		&b.ID,
		&b.HousingID,
		&b.CheckIn,
		&b.CheckOut,
		&b.GuestsCount,
		&b.PricePerNightSnapshot,
		&b.ServiceFee,
		&b.TotalPrice,
		&b.Status,
		&b.PaymentMethodID,
		&b.CreatedAt,
	)
	if err != nil {
		return response.BookingResponse{}, fmt.Errorf("booking repository: create booking: %w", err)
	}
	return b, nil
}

func (r *BookingRepository) GetBookingByID(bookingID string, userID string, ctx context.Context) (response.BookingResponse, error) {
	var b response.BookingResponse

	err := r.database.db.QueryRowContext(ctx, `
		SELECT id, housing_id, check_in, check_out, guests_count,
		       price_per_night_snapshot, service_fee, total_price,
		       status, payment_method_id, created_at
		FROM bookings
		WHERE id = $1 AND user_id = $2
	`, bookingID, userID).Scan(
		&b.ID,
		&b.HousingID,
		&b.CheckIn,
		&b.CheckOut,
		&b.GuestsCount,
		&b.PricePerNightSnapshot,
		&b.ServiceFee,
		&b.TotalPrice,
		&b.Status,
		&b.PaymentMethodID,
		&b.CreatedAt,
	)
	if err != nil {
		return response.BookingResponse{}, fmt.Errorf("booking repository: get booking by id: %w", err)
	}
	return b, nil
}

func (r *BookingRepository) GetBookingListByUser(userID string, ctx context.Context) (response.BookingListResponse, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT id, housing_id, check_in, check_out, total_price, status, created_at
		FROM bookings
		WHERE user_id = $1
		ORDER BY check_in DESC
	`, userID)
	if err != nil {
		return response.BookingListResponse{}, fmt.Errorf("booking repository: get booking list by user: %w", err)
	}
	defer rows.Close()

	var items []response.BookingListItem
	for rows.Next() {
		var item response.BookingListItem
		err := rows.Scan(
			&item.ID,
			&item.HousingID,
			&item.CheckIn,
			&item.CheckOut,
			&item.TotalPrice,
			&item.Status,
			&item.CreatedAt,
		)
		if err != nil {
			return response.BookingListResponse{}, fmt.Errorf("booking repository: scan booking list item: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return response.BookingListResponse{}, fmt.Errorf("booking repository: iterate booking list rows: %w", err)
	}

	return response.BookingListResponse{
		Items: items,
		Total: len(items),
	}, nil
}

func (r *BookingRepository) DeleteBooking(bookingID string, userID string, ctx context.Context) error {
	_, err := r.database.db.ExecContext(ctx, `
		DELETE FROM bookings
		WHERE id = $1 AND user_id = $2
	`, bookingID, userID)
	if err != nil {
		return fmt.Errorf("booking repository: delete booking: %w", err)
	}
	return nil
}