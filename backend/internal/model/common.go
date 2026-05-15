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

// HousingResponse полная карточка объекта жилья.
type HousingResponse struct {
    // UUID объекта жилья.
    ID                  string         `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
    // UUID владельца объекта.
    UserID              string         `json:"user_id" example:"440e8400-e29b-41d4-a716-446655440000"`
    // Тип объекта жилья.
    HousingType         string         `json:"housing_type" example:"apartment" enums:"apartment,house,office"`
    // Статус объекта.
    Status              string         `json:"status" example:"published" enums:"draft,published,unpublished"`
    // Название объекта.
    Title               *string        `json:"title,omitempty" example:"Современная квартира в центре"`
    // Подробное описание жилья.
    Description         *string        `json:"description,omitempty" example:"Светлая квартира рядом с метро, бесконтактное заселение, быстрый Wi-Fi."`
    // Адрес объекта.
    Address             *string        `json:"address,omitempty" example:"Москва, ул. Тверская, 12"`
    // Широта объекта.
    Latitude            *float64       `json:"latitude,omitempty" example:"55.7558"`
    // Долгота объекта.
    Longitude           *float64       `json:"longitude,omitempty" example:"37.6173"`
    // Цена за одну ночь.
    PricePerNight       *float64       `json:"price_per_night,omitempty" example:"6500.00"`
    // Максимальное количество гостей.
    MaxGuests           *int           `json:"max_guests,omitempty" example:"4"`
    // Список удобств объекта.
    Amenities           []string       `json:"amenities" example:"wifi,smart_lock" enums:"kitchen,wifi,air_conditioner,parking,washing_machine,heating,smart_lock,smart_lighting,smart_thermostat,voice_assistant"`
    // Правила отмены бронирования.
    CancellationPolicy  string         `json:"cancellation_policy" example:"flexible" enums:"flexible,moderate,strict"`
    // Средняя оценка объекта.
    RatingAvg           *float64       `json:"rating_avg,omitempty" example:"4.8"`
    // Количество оценок.
    RatingCount         int            `json:"rating_count" example:"12"`
    // Изображения объекта жилья.
    Images              []HousingImage `json:"images"`
    // Дата создания объекта.
    CreatedAt           time.Time      `json:"created_at" example:"2026-05-15T12:00:00Z"`
    // Дата последнего обновления объекта.
    UpdatedAt           time.Time      `json:"updated_at" example:"2026-05-15T12:30:00Z"`
}

// HousingImage изображение объекта жилья.
type HousingImage struct {
	// UUID изображения.
	ID         string `json:"ID" example:"880e8400-e29b-41d4-a716-446655440000"`
	// UUID объекта жилья.
	HousingID  string `json:"HousingID" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Storage key файла в S3/MinIO.
	StorageKey string `json:"StorageKey" example:"/housing/550e8400-e29b-41d4-a716-446655440000/7a45d9c2-0000-4000-9000-123456789abc.jpg"`
    // Публичный URL изображения, сформированный из storage key.
    ImageURL   *string `json:"ImageURL" example:"https://cdn.keyfreestay.local/housing/550e8400-e29b-41d4-a716-446655440000/7a45d9c2-0000-4000-9000-123456789abc.jpg"`
	// Позиция изображения в галерее.
	Position   int `json:"Position" example:"0"`
}

type ContactRequest struct {
	// Имя заявителя.
	Name  string `json:"name"  validate:"required,min=2,max=100" example:"Иван Петров"`
	// Email для обратной связи.
	Email string `json:"email" validate:"required,email" example:"ivan.petrov@example.com"`
	// Телефон для обратной связи.
	Phone string `json:"phone" validate:"required,min=5,max=20" example:"+1234567890"`
}
