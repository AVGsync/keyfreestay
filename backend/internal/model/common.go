package model

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// User struct
type User struct {
	ID                  string     `json:"id"`
	FullName            string     `json:"full_name"`
	Email               string     `json:"email"`
	Phone               string     `json:"phone"`
	PasswordHash        string     `json:"password_hash"`
	Role                string     `json:"role"`
	SubscriptionPlan    string     `json:"subscription_plan"`
	SubscriptionExpires *time.Time `json:"subscription_expires"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

type Claims struct {
	UserID           string `json:"user_id"`
	Role             string `json:"role"`
	SubscriptionPlan string `json:"subscription_plan"`

	jwt.RegisteredClaims
}

// Housing struct
type HousingResponse struct {
    ID                  string         `json:"id"`
    UserID              string         `json:"user_id"`
    HousingType         string         `json:"housing_type"`
    Status              string         `json:"status"`
    Title               *string        `json:"title,omitempty"`
    Description         *string        `json:"description,omitempty"`
    Address             *string        `json:"address,omitempty"`
    Latitude            *float64       `json:"latitude,omitempty"`
    Longitude           *float64       `json:"longitude,omitempty"`
    PricePerNight       *float64       `json:"price_per_night,omitempty"`
    MaxGuests           *int           `json:"max_guests,omitempty"`
    Amenities           []string       `json:"amenities"`
    CancellationPolicy  string         `json:"cancellation_policy"`
    RatingAvg           *float64       `json:"rating_avg,omitempty"`
    RatingCount         int            `json:"rating_count"`
    Images              []HousingImage `json:"images"`
    CreatedAt           time.Time      `json:"created_at"`
    UpdatedAt           time.Time      `json:"updated_at"`
}

type HousingImage struct {
	ID         string
	HousingID  string
	StorageKey string
    ImageURL   *string
	Position   int
}

type ContactRequest struct {
	Name  string `json:"name"  validate:"required,min=2,max=100"`
	Email string `json:"email" validate:"required,email"`
	Phone string `json:"phone" validate:"required,min=5,max=20"`
}