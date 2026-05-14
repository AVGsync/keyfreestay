package request

// POST /api/housing — может быть пустым, может содержать что-то из формы
type CreateHousingRequest struct {
    HousingType *string `json:"housing_type,omitempty" validate:"omitempty,oneof=apartment house office" example:"apartment"`
    Title       *string `json:"title,omitempty" validate:"omitempty,min=3,max=200" example:"Современная квартира в центре"`
    Description *string `json:"description,omitempty" validate:"omitempty,max=5000"`
    Address     *string `json:"address,omitempty" validate:"omitempty,min=3,max=500" example:"Москва, ул. Тверская, 12"`
}

// PATCH /api/housing/{id} — все поля опциональны.
type UpdateHousingRequest struct {
    HousingType        *string   `json:"housing_type,omitempty" validate:"omitempty,oneof=apartment house office"`
    Status             *string   `json:"status,omitempty" validate:"omitempty,oneof=draft published unpublished"`
    Title              *string   `json:"title,omitempty" validate:"omitempty,min=3,max=200"`
    Description        *string   `json:"description,omitempty" validate:"omitempty,max=5000"`
    Address            *string   `json:"address,omitempty" validate:"omitempty,min=3,max=500"`
    Latitude           *float64  `json:"latitude,omitempty" validate:"omitempty,latitude"`
    Longitude          *float64  `json:"longitude,omitempty" validate:"omitempty,longitude"`
    PricePerNight      *float64  `json:"price_per_night,omitempty" validate:"omitempty,gt=0"`
    MaxGuests          *int      `json:"max_guests,omitempty" validate:"omitempty,gt=0,lte=50"`
    Amenities          *[]string `json:"amenities,omitempty" validate:"omitempty,dive,oneof=kitchen wifi air_conditioner parking washing_machine heating smart_lock smart_lighting smart_thermostat voice_assistant"`
    CancellationPolicy *string   `json:"cancellation_policy,omitempty" validate:"omitempty,oneof=flexible moderate strict"`
}
