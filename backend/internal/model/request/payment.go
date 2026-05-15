package request

type CreatePaymentMethodRequest struct {
	CardLast4      string `json:"card_last4"      validate:"required,len=4,numeric"`
	CardBrand      string `json:"card_brand"      validate:"required,oneof=visa mastercard mir unionpay other"`
	ExpiryMonth    int    `json:"expiry_month"    validate:"required,gte=1,lte=12"`
	ExpiryYear     int    `json:"expiry_year"     validate:"required,gte=2024,lte=2099"`
	CardholderName string `json:"cardholder_name" validate:"required,min=2,max=100"`
	IsDefault      bool   `json:"is_default"`
}