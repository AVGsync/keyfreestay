package request

type CreateBookingRequest struct {
	HousingID       string  `json:"housing_id"       validate:"required,uuid"`
	CheckIn         string  `json:"check_in"         validate:"required,datetime=2006-01-02"`
	CheckOut        string  `json:"check_out"        validate:"required,datetime=2006-01-02"`
	GuestsCount     int     `json:"guests_count"     validate:"required,gt=0"`
	PaymentMethodID *string `json:"payment_method_id,omitempty" validate:"omitempty,uuid"`
}