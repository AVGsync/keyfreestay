package postgres

import (
	"context"
	"fmt"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
	"github.com/lib/pq"
)

type HousingRepository struct {
	database *DB
}

func (r *HousingRepository) CreateHousing(housing *request.CreateHousingRequest, userID string, ctx context.Context) (string, error) {
	var id string
	err := r.database.db.QueryRowContext(ctx, `
		INSERT INTO housing (user_id, housing_type, title, description, address)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, 
	userID,
	housing.HousingType,
	housing.Title, 
	housing.Description, 
	housing.Address,
	).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("housing repository: create housing: %w", err)
	}
	return id, nil
}

func (r *HousingRepository) UpdateHousing(housing *request.UpdateHousingRequest, housingID string, userID string, ctx context.Context) error {
	_, err := r.database.db.ExecContext(ctx, `
		UPDATE housing
		SET housing_type = COALESCE($1, housing_type),
				status = COALESCE($2, status),
				title = COALESCE($3, title),
				description = COALESCE($4, description),
				address = COALESCE($5, address),
				latitude = COALESCE($6, latitude),
				longitude = COALESCE($7, longitude),
				price_per_night = COALESCE($8, price_per_night),
				max_guests = COALESCE($9, max_guests),
				amenities = COALESCE($10, amenities),
				cancellation_policy = COALESCE($11, cancellation_policy),
				updated_at = NOW()
		WHERE id = $12 AND user_id = $13
	`,
	housing.HousingType,
	housing.Status,
	housing.Title,
	housing.Description,
	housing.Address,
	housing.Latitude,
	housing.Longitude,
	housing.PricePerNight,
	housing.MaxGuests,
	housing.Amenities,
	housing.CancellationPolicy,
	housingID,
	userID,
	)
	if err != nil {
		return fmt.Errorf("housing repository: update housing: %w", err)
	}
	return nil
}

func (r *HousingRepository) GetHousingByID(housingID string, ctx context.Context) (model.HousingResponse, error) {
	var housing model.HousingResponse
	err := r.database.db.QueryRowContext(ctx, `
		SELECT id, user_id, housing_type, status, title, description, address, latitude, longitude, price_per_night, max_guests, amenities, cancellation_policy, rating_avg, rating_count, created_at, updated_at
		FROM housing
		WHERE id = $1
	`, housingID).Scan(
		&housing.ID,
		&housing.UserID,
		&housing.HousingType,
		&housing.Status,
		&housing.Title,
		&housing.Description,
		&housing.Address,
		&housing.Latitude,
		&housing.Longitude,
		&housing.PricePerNight,
		&housing.MaxGuests,
		pq.Array(&housing.Amenities),
		&housing.CancellationPolicy,
		&housing.RatingAvg,
		&housing.RatingCount,
		&housing.CreatedAt,
		&housing.UpdatedAt,
	)
	if err != nil {
		return model.HousingResponse{}, fmt.Errorf("housing repository: get housing by id: %w", err)
	}
	return housing, nil
}

func (r *HousingRepository) GetHousingListForOwner(userID string, ctx context.Context) (response.HousingListResponse, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT id, title, housing_type, status, address, price_per_night, max_guests, rating_avg, rating_count
		FROM housing
		WHERE user_id = $1
	`, userID)
	if err != nil {
		return response.HousingListResponse{}, fmt.Errorf("housing repository: get housing list for owner: %w", err)
	}
	defer rows.Close()

	var items []response.HousingListItem
	var total int
	for rows.Next() {
		var item response.HousingListItem
		err := rows.Scan(
			&item.ID,
			&item.Title,
			&item.HousingType,
			&item.Status,
			&item.Address,
			&item.PricePerNight,
			&item.MaxGuests,
			&item.RatingAvg,
			&item.RatingCount,
		)
		if err != nil {
			return response.HousingListResponse{}, fmt.Errorf("housing repository: scan housing list item: %w", err)
		}
		items = append(items, item)
		total++
	}
	if err := rows.Err(); err != nil {
		return response.HousingListResponse{}, fmt.Errorf("housing repository: iterate housing list rows: %w", err)
	}

	return response.HousingListResponse{
		Items: items,
		Total: total,
	}, nil
}

func (r *HousingRepository) GetHousingListForUser(ctx context.Context) (response.HousingListResponse, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT id, title, housing_type, status, address, price_per_night, max_guests, rating_avg, rating_count
		FROM housing
		WHERE status = 'published'
	`)
	if err != nil {
		return response.HousingListResponse{}, fmt.Errorf("housing repository: get housing list for user: %w", err)
	}
	defer rows.Close()

	var items []response.HousingListItem
	var total int
	for rows.Next() {
		var item response.HousingListItem
		err := rows.Scan(
			&item.ID,
			&item.Title,
			&item.HousingType,
			&item.Status,
			&item.Address,
			&item.PricePerNight,
			&item.MaxGuests,
			&item.RatingAvg,
			&item.RatingCount,
		)
		if err != nil {
			return response.HousingListResponse{}, fmt.Errorf("housing repository: scan housing list item: %w", err)
		}
		items = append(items, item)
		total++
	}
	if err := rows.Err(); err != nil {
		return response.HousingListResponse{}, fmt.Errorf("housing repository: iterate housing list rows: %w", err)
	}

	return response.HousingListResponse{
		Items: items,
		Total: total,
	}, nil
}