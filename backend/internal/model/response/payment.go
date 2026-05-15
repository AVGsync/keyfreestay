package response

import "time"

type PaymentMethodResponse struct {
	// UUID платёжного метода.
	ID string `json:"id" example:"660e8400-e29b-41d4-a716-446655440000"`
	// Последние 4 цифры карты.
	CardLast4 string `json:"card_last4" example:"4242"`
	// Платёжная система карты.
	CardBrand string `json:"card_brand" example:"visa" enums:"visa,mastercard,mir,unionpay,other"`
	// Месяц окончания срока действия карты.
	ExpiryMonth int `json:"expiry_month" example:"12" minimum:"1" maximum:"12"`
	// Год окончания срока действия карты.
	ExpiryYear int `json:"expiry_year" example:"2028" minimum:"2024" maximum:"2099"`
	// Имя держателя карты.
	CardholderName string `json:"cardholder_name" example:"IVAN PETROV"`
	// Является ли метод основным.
	IsDefault bool `json:"is_default" example:"true"`
	// Дата добавления платёжного метода.
	CreatedAt time.Time `json:"created_at" example:"2026-05-15T12:00:00Z"`
}

type PaymentMethodListResponse struct {
	// Платёжные методы пользователя.
	Items []PaymentMethodResponse `json:"items"`
	// Общее количество методов в ответе.
	Total int `json:"total" example:"2"`
}
