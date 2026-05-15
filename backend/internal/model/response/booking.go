package response

import "time"

type BookingResponse struct {
	ID                    string    `json:"id"`
	HousingID             string    `json:"housing_id"`
	CheckIn               time.Time `json:"check_in"`
	CheckOut              time.Time `json:"check_out"`
	GuestsCount           int       `json:"guests_count"`
	PricePerNightSnapshot float64   `json:"price_per_night_snapshot"`
	ServiceFee            float64   `json:"service_fee"`
	TotalPrice            float64   `json:"total_price"`
	Status                string    `json:"status"`
	PaymentMethodID       *string   `json:"payment_method_id,omitempty"`
	CreatedAt             time.Time `json:"created_at"`
}

type BookingListItem struct {
	ID         string    `json:"id"`
	HousingID  string    `json:"housing_id"`
	CheckIn    time.Time `json:"check_in"`
	CheckOut   time.Time `json:"check_out"`
	TotalPrice float64   `json:"total_price"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

type BookingListResponse struct {
	Items []BookingListItem `json:"items"`
	Total int               `json:"total"`
}