package response

// Краткий объект для списков (главная, "Мои объекты")
type HousingListItem struct {
    ID               string   `json:"id" example:"f42ebd6e-..."`
    Title            *string  `json:"title,omitempty"`
    HousingType      string   `json:"housing_type" example:"apartment"`
    Status           string   `json:"status" example:"published" enums:"draft,published,unpublished"`
    Address          *string  `json:"address,omitempty"`
    PricePerNight    *float64 `json:"price_per_night,omitempty"`
    MaxGuests        *int     `json:"max_guests,omitempty"`
    RatingAvg        *float64 `json:"rating_avg,omitempty"`
    RatingCount      int      `json:"rating_count"`
    ThumbnailURL     *string  `json:"thumbnail_url,omitempty"`  // первое фото
}

type HousingListResponse struct {
    Items  []HousingListItem `json:"items"`
    Total  int               `json:"total" example:"42"`
}