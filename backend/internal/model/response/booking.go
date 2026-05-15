package response

import "time"

type BookingResponse struct {
	// UUID бронирования.
	ID string `json:"id" example:"770e8400-e29b-41d4-a716-446655440000"`
	// UUID объекта жилья.
	HousingID string `json:"housing_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Дата заезда.
	CheckIn time.Time `json:"check_in" example:"2026-06-10T00:00:00Z"`
	// Дата выезда.
	CheckOut time.Time `json:"check_out" example:"2026-06-15T00:00:00Z"`
	// Количество гостей.
	GuestsCount int `json:"guests_count" example:"2"`
	// Цена за ночь, зафиксированная на момент бронирования.
	PricePerNightSnapshot float64 `json:"price_per_night_snapshot" example:"6500.00"`
	// Сервисный сбор.
	ServiceFee float64 `json:"service_fee" example:"500.00"`
	// Итоговая стоимость бронирования.
	TotalPrice float64 `json:"total_price" example:"33000.00"`
	// Статус бронирования.
	Status string `json:"status" example:"pending" enums:"pending,confirmed,cancelled,completed"`
	// UUID платёжного метода, если он был выбран.
	PaymentMethodID *string `json:"payment_method_id,omitempty" example:"660e8400-e29b-41d4-a716-446655440000"`
	// Дата создания бронирования.
	CreatedAt time.Time `json:"created_at" example:"2026-05-15T12:00:00Z"`
}

type BookingListItem struct {
	// UUID бронирования.
	ID string `json:"id" example:"770e8400-e29b-41d4-a716-446655440000"`
	// UUID объекта жилья.
	HousingID string `json:"housing_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Дата заезда.
	CheckIn time.Time `json:"check_in" example:"2026-06-10T00:00:00Z"`
	// Дата выезда.
	CheckOut time.Time `json:"check_out" example:"2026-06-15T00:00:00Z"`
	// Итоговая стоимость бронирования.
	TotalPrice float64 `json:"total_price" example:"33000.00"`
	// Статус бронирования.
	Status string `json:"status" example:"pending" enums:"pending,confirmed,cancelled,completed"`
	// Дата создания бронирования.
	CreatedAt time.Time `json:"created_at" example:"2026-05-15T12:00:00Z"`
}

type BookingListResponse struct {
	// Бронирования текущего пользователя.
	Items []BookingListItem `json:"items"`
	// Общее количество элементов в ответе.
	Total int `json:"total" example:"3"`
}
