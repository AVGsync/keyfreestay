package response

import "time"

type PaymentMethodResponse struct {
	ID             string    `json:"id"`
	CardLast4      string    `json:"card_last4"`
	CardBrand      string    `json:"card_brand"`
	ExpiryMonth    int       `json:"expiry_month"`
	ExpiryYear     int       `json:"expiry_year"`
	CardholderName string    `json:"cardholder_name"`
	IsDefault      bool      `json:"is_default"`
	CreatedAt      time.Time `json:"created_at"`
}

type PaymentMethodListResponse struct {
	Items []PaymentMethodResponse `json:"items"`
	Total int                     `json:"total"`
}