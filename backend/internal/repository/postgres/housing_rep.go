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
		SELECT id, user_id, housing_type, status, title, description, address,
		       latitude, longitude, price_per_night, max_guests, amenities,
		       cancellation_policy, rating_avg, rating_count, created_at, updated_at
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

	// images
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT id, housing_id, storage_key, position
		FROM housing_images
		WHERE housing_id = $1
		ORDER BY position
	`, housingID)
	if err != nil {
		return model.HousingResponse{}, fmt.Errorf("housing repository: get images: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var img model.HousingImage
		if err := rows.Scan(&img.ID, &img.HousingID, &img.StorageKey, &img.Position); err != nil {
			return model.HousingResponse{}, fmt.Errorf("housing repository: scan image: %w", err)
		}
		housing.Images = append(housing.Images, img)
	}
	if err := rows.Err(); err != nil {
		return model.HousingResponse{}, fmt.Errorf("housing repository: iterate images: %w", err)
	}

	return housing, nil
}

func (r *HousingRepository) GetHousingListForOwner(userID string, ctx context.Context) (response.HousingListResponse, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT h.id, h.title, h.housing_type, h.status, h.address,
		       h.price_per_night, h.max_guests, h.rating_avg, h.rating_count,
		       (SELECT storage_key FROM housing_images
		        WHERE housing_id = h.id
		        ORDER BY position
		        LIMIT 1) AS thumb_key
		FROM housing h
		WHERE h.user_id = $1
	`, userID)
	if err != nil {
		return response.HousingListResponse{}, fmt.Errorf("housing repository: get list for owner: %w", err)
	}
	defer rows.Close()

	var items []response.HousingListItem
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
			&item.ThumbnailURL,   
		)
		if err != nil {
			return response.HousingListResponse{}, fmt.Errorf("housing repository: scan: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return response.HousingListResponse{}, fmt.Errorf("housing repository: iterate: %w", err)
	}

	return response.HousingListResponse{
		Items: items, 
		Total: len(items),
		}, nil
}

func (r *HousingRepository) GetHousingListForUser(ctx context.Context) (response.HousingListResponse, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT h.id, h.title, h.housing_type, h.status, h.address, h.price_per_night, h.max_guests, h.rating_avg, h.rating_count,
		       (SELECT storage_key FROM housing_images
		        WHERE housing_id = h.id
		        ORDER BY position
		        LIMIT 1) AS thumb_key
		FROM housing h
		WHERE h.status = 'published'
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
			&item.ThumbnailURL,
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

func (r *HousingRepository) DeleteHousing(housingID string, ctx context.Context) error {
	_, err := r.database.db.ExecContext(ctx, `
		DELETE FROM housing
		WHERE id = $1
	`, housingID)
	if err != nil {
		return fmt.Errorf("housing repository: delete housing: %w", err)
	}
	return nil
}

func (r *HousingRepository) AddImage(ctx context.Context, housingID, userID, storageKey string) (model.HousingImage, error) {
	var img model.HousingImage

	// проверяем владение и вставляем position = MAX+1
	err := r.database.db.QueryRowContext(ctx, `
		INSERT INTO housing_images (housing_id, storage_key, position)
		SELECT $1, $2, COALESCE(
			(SELECT MAX(position) + 1 FROM housing_images WHERE housing_id = $1),
			0
		)
		WHERE EXISTS (
			SELECT 1 FROM housing WHERE id = $1 AND user_id = $3
		)
		RETURNING id, housing_id, storage_key, position
	`, housingID, storageKey, userID).Scan(&img.ID, &img.HousingID, &img.StorageKey, &img.Position)
	if err != nil {
		return model.HousingImage{}, fmt.Errorf("housing repository: add image: %w", err)
	}
	return img, nil
}

func (r *HousingRepository) DeleteImage(ctx context.Context, key string) error {
	_, err := r.database.db.ExecContext(ctx, `
		DELETE FROM housing_images
		WHERE storage_key = $1
	`, key)
	if err != nil {
		return fmt.Errorf("housing repository: delete image: %w", err)
	}
	return nil
}