package response

import "time"

type UserResponse struct {
	// UUID пользователя.
	ID                  string     `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Email пользователя.
	Email               string     `json:"email" example:"ivan.petrov@example.com"`
	// Полное имя пользователя.
	Fullname            string     `json:"full_name" example:"Иван Петров"`
	// Телефон пользователя, если указан.
	Phone               string     `json:"phone,omitempty" example:"+1234567890"`
	// Роль пользователя.
	Role                string     `json:"role" example:"user" enums:"user,admin"`
	// Тарифный план пользователя.
	SubscriptionPlan    string     `json:"subscription_plan" example:"free" enums:"free,pro,enterprise"`
	// Дата окончания подписки. Для бесплатного тарифа может быть null.
	SubscriptionExpires *time.Time `json:"subscription_expires,omitempty" example:"2026-12-31T23:59:59Z"`
}
