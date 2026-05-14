package model

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

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

type SaleDetail struct {
	SoldAt      time.Time `json:"sold_at" example:"2026-04-29T00:00:00Z"`
	ProductName string    `json:"product_name" example:"iPhone 15"`
	Category    string    `json:"category" example:"Смартфоны"`
	Quantity    int       `json:"quantity" example:"4"`
	Revenue     float64   `json:"revenue" example:"399996.00"`
}

