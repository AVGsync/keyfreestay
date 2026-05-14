package postgres

import (
	"context"
	"fmt"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
)

type UserRepository struct {
	database *DB
}

func (r *UserRepository) RegisterNewUser(user *model.User, ctx context.Context) (response.UserResponse, error) {
	u := response.UserResponse{}

	err := r.database.db.QueryRowContext(ctx, `
		INSERT INTO users (full_name, email, phone, password_hash, role, subscription_plan, subscription_expires, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, full_name, email, phone, role, subscription_plan, subscription_expires
	`, user.FullName, user.Email, user.Phone, user.PasswordHash, user.Role, user.SubscriptionPlan, user.SubscriptionExpires, user.CreatedAt, user.UpdatedAt).Scan(
		&u.ID, 
		&u.Fullname, 
		&u.Email, 
		&u.Phone,
		&u.Role, 
		&u.SubscriptionPlan, 
		&u.SubscriptionExpires,
	)
	if err != nil {
		return u, fmt.Errorf("user repository: register new user: %w", err)
	}
	return u, err
}

func (r *UserRepository) UpdateUser(user *model.User, ctx context.Context) (response.UserResponse,error) {
	u := response.UserResponse{}
	  err := r.database.db.QueryRowContext(ctx, `
		UPDATE users
		SET full_name = $2, email = $3, phone = $4, role = $5, subscription_plan = $6, subscription_expires = $7
		WHERE id = $1
		RETURNING id, full_name, email, phone, role, subscription_plan, subscription_expires
	`, user.ID, user.FullName, user.Email, user.Phone, user.Role, user.SubscriptionPlan, user.SubscriptionExpires).Scan(
		&u.ID, 
		&u.Fullname, 
		&u.Email, 
		&u.Phone,
		&u.Role, 
		&u.SubscriptionPlan, 
		&u.SubscriptionExpires,
	)
	if err != nil {
		return response.UserResponse{}, fmt.Errorf("user repository: update user: %w", err)
	}
	return u, nil
}

func (r *UserRepository) GetUserByEmail(email string, ctx context.Context) (model.User, error) {
	var user model.User
	err := r.database.db.QueryRowContext(ctx, `
		SELECT id, full_name, email, phone, password_hash, role, subscription_plan, subscription_expires
		FROM users
		WHERE email = $1
	`, email).Scan(
		&user.ID, 
		&user.FullName, 
		&user.Email, 
		&user.Phone,
		&user.PasswordHash, 
		&user.Role, 
		&user.SubscriptionPlan, 
		&user.SubscriptionExpires,
	)
	if err != nil {
		return user, fmt.Errorf("user repository: get user by email: %w", err)
	}
	return user, nil
}

func (r *UserRepository) GetUserByID(id string, ctx context.Context) (model.User, error) {
	var user model.User
	err := r.database.db.QueryRowContext(ctx, `
		SELECT id, full_name, email, phone, password_hash, role, subscription_plan, subscription_expires
		FROM users
		WHERE id = $1
	`, id).Scan(
		&user.ID, 
		&user.FullName, 
		&user.Email, 
		&user.Phone,
		&user.PasswordHash, 
		&user.Role, 
		&user.SubscriptionPlan, 
		&user.SubscriptionExpires,
	)
	if err != nil {
		return user, fmt.Errorf("user repository: get user by ID: %w", err)
	}
	return user, nil
}
