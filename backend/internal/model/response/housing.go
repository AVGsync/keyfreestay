package response

// HousingListItem краткая карточка объекта жилья для каталога и списка "Мои объекты".
type HousingListItem struct {
    // UUID объекта жилья.
    ID               string   `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
    // Название объекта.
    Title            *string  `json:"title,omitempty" example:"Современная квартира в центре"`
    // Тип объекта жилья.
    HousingType      string   `json:"housing_type" example:"apartment" enums:"apartment,house,office"`
    // Статус объекта.
    Status           string   `json:"status" example:"published" enums:"draft,published,unpublished"`
    // Адрес объекта.
    Address          *string  `json:"address,omitempty" example:"Москва, ул. Тверская, 12"`
    // Цена за одну ночь.
    PricePerNight    *float64 `json:"price_per_night,omitempty" example:"6500.00"`
    // Максимальное количество гостей.
    MaxGuests        *int     `json:"max_guests,omitempty" example:"4"`
    // Средняя оценка объекта.
    RatingAvg        *float64 `json:"rating_avg,omitempty" example:"4.8"`
    // Количество оценок.
    RatingCount      int      `json:"rating_count" example:"12"`
    // Публичный URL первого изображения объекта, если изображение есть.
    ThumbnailURL     *string  `json:"thumbnail_url,omitempty" example:"https://cdn.keyfreestay.local/housing/550e8400-e29b-41d4-a716-446655440000/photo.jpg"`
}

type HousingListResponse struct {
    // Краткие карточки объектов жилья.
    Items  []HousingListItem `json:"items"`
    // Общее количество объектов в ответе.
    Total  int               `json:"total" example:"42"`
}
