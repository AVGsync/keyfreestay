package request

type NewUserRequest struct {
	// Полное имя пользователя, отображается в профиле.
	FullName string `json:"full_name" validate:"required,min=3,max=64" example:"Иван Петров"`
	// Уникальный email, используется для входа.
	Email string `json:"email" validate:"required,email" example:"ivan.petrov@example.com"`
	// Номер телефона в международном формате E.164.
	Phone string `json:"phone,omitempty" validate:"omitempty,e164" example:"+1234567890"`
	// Пароль, минимум 8 символов.
	Password string `json:"password" validate:"required,min=8" example:"Str0ngPass!2026"`
}

type LoginRequest struct {
	// Email зарегистрированного пользователя.
	Email string `json:"email" validate:"required,email" example:"ivan.petrov@example.com"`
	// Пароль пользователя.
	Password string `json:"password" validate:"required" example:"Str0ngPass!2026"`
}

type UserUpdateRequest struct {
	// Новый email. Если поле не передано, текущее значение не меняется.
	Email *string `json:"email,omitempty" validate:"omitempty,email" example:"ivan.new@example.com"`
	// Новое полное имя. Если поле не передано, текущее значение не меняется.
	Fullname *string `json:"full_name,omitempty" validate:"omitempty,min=3,max=64" example:"Иван Сергеевич Петров"`
	// Новый номер телефона. Если поле не передано, текущее значение не меняется.
	Phone *string `json:"phone,omitempty" validate:"omitempty,e164" example:"+1234567890"`
}

type ChangePasswordRequest struct {
	// Текущий пароль пользователя.
	OldPassword string `json:"old_password" validate:"required" example:"Str0ngPass!2026"`
	// Новый пароль, минимум 8 символов.
	NewPassword string `json:"new_password" validate:"required,min=8" example:"N3wStr0ngPass!2026"`
}
