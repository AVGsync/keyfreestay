package request

type CreateHousingRequest struct {
    // Тип объекта жилья. Если не передан, БД использует значение по умолчанию `apartment`.
    HousingType *string `json:"housing_type,omitempty" validate:"omitempty,oneof=apartment house office" example:"apartment" enums:"apartment,house,office"`
    // Название объекта для каталога и карточки жилья.
    Title       *string `json:"title,omitempty" validate:"omitempty,min=3,max=200" example:"Современная квартира в центре"`
    // Подробное описание жилья, правил и особенностей проживания.
    Description *string `json:"description,omitempty" validate:"omitempty,max=5000" example:"Светлая квартира рядом с метро, бесконтактное заселение, быстрый Wi-Fi."`
    // Адрес объекта жилья в свободной форме.
    Address     *string `json:"address,omitempty" validate:"omitempty,min=3,max=500" example:"Москва, ул. Тверская, 12"`
}

type UpdateHousingRequest struct {
    // Тип объекта жилья.
    HousingType        *string   `json:"housing_type,omitempty" validate:"omitempty,oneof=apartment house office" example:"apartment" enums:"apartment,house,office"`
    // Статус объекта. `published` доступен только когда заполнены обязательные поля для публикации.
    Status             *string   `json:"status,omitempty" validate:"omitempty,oneof=draft published unpublished" example:"published" enums:"draft,published,unpublished"`
    // Название объекта для каталога и карточки жилья.
    Title              *string   `json:"title,omitempty" validate:"omitempty,min=3,max=200" example:"Современная квартира в центре"`
    // Подробное описание жилья, правил и особенностей проживания.
    Description        *string   `json:"description,omitempty" validate:"omitempty,max=5000" example:"Светлая квартира рядом с метро, бесконтактное заселение, быстрый Wi-Fi."`
    // Адрес объекта жилья в свободной форме.
    Address            *string   `json:"address,omitempty" validate:"omitempty,min=3,max=500" example:"Москва, ул. Тверская, 12"`
    // Широта объекта для карты.
    Latitude           *float64  `json:"latitude,omitempty" validate:"omitempty,latitude" example:"55.7558"`
    // Долгота объекта для карты.
    Longitude          *float64  `json:"longitude,omitempty" validate:"omitempty,longitude" example:"37.6173"`
    // Цена за одну ночь в валюте сервиса.
    PricePerNight      *float64  `json:"price_per_night,omitempty" validate:"omitempty,gt=0" example:"6500.00"`
    // Максимальное количество гостей.
    MaxGuests          *int      `json:"max_guests,omitempty" validate:"omitempty,gt=0,lte=50" example:"4"`
    // Список удобств объекта.
    Amenities          *[]string `json:"amenities,omitempty" validate:"omitempty,dive,oneof=kitchen wifi air_conditioner parking washing_machine heating smart_lock smart_lighting smart_thermostat voice_assistant" example:"wifi,smart_lock" enums:"kitchen,wifi,air_conditioner,parking,washing_machine,heating,smart_lock,smart_lighting,smart_thermostat,voice_assistant"`
    // Правила отмены бронирования.
    CancellationPolicy *string   `json:"cancellation_policy,omitempty" validate:"omitempty,oneof=flexible moderate strict" example:"flexible" enums:"flexible,moderate,strict"`
}
