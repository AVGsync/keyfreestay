package request

type CreatePaymentMethodRequest struct {
	// Последние 4 цифры карты. Полный номер карты API не принимает.
	CardLast4 string `json:"card_last4"      validate:"required,len=4,numeric" example:"4242"`
	// Платёжная система карты.
	CardBrand string `json:"card_brand"      validate:"required,oneof=visa mastercard mir unionpay other" example:"visa" enums:"visa,mastercard,mir,unionpay,other"`
	// Месяц окончания срока действия карты.
	ExpiryMonth int `json:"expiry_month"    validate:"required,gte=1,lte=12" example:"12" minimum:"1" maximum:"12"`
	// Год окончания срока действия карты.
	ExpiryYear int `json:"expiry_year"     validate:"required,gte=2024,lte=2099" example:"2028" minimum:"2024" maximum:"2099"`
	// Имя держателя карты.
	CardholderName string `json:"cardholder_name" validate:"required,min=2,max=100" example:"IVAN PETROV"`
	// Сделать метод основным для пользователя.
	IsDefault bool `json:"is_default" example:"true"`
}
