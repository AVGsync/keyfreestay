package request

type CreateBookingRequest struct {
	// UUID опубликованного объекта жилья.
	HousingID string `json:"housing_id"       validate:"required,uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Дата заезда в формате YYYY-MM-DD.
	CheckIn string `json:"check_in"         validate:"required,datetime=2006-01-02" example:"2026-06-10"`
	// Дата выезда в формате YYYY-MM-DD. Должна быть позже даты заезда.
	CheckOut string `json:"check_out"        validate:"required,datetime=2006-01-02" example:"2026-06-15"`
	// Количество гостей. Не должно превышать вместимость объекта.
	GuestsCount int `json:"guests_count"     validate:"required,gt=0" example:"2"`
	// UUID платёжного метода пользователя. Поле необязательно.
	PaymentMethodID *string `json:"payment_method_id,omitempty" validate:"omitempty,uuid" example:"660e8400-e29b-41d4-a716-446655440000"`
}
