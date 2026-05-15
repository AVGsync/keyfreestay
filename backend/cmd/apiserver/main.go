package main

import (
	"github.com/AVGsync/keyfreestay/backend/internal/app/apiserver"
)

// @title KeyFreeStay API
// @version 1.0
// @description REST API сервиса KeyFreeStay для краткосрочной аренды жилья без ключей.
// @description
// @description API покрывает регистрацию и вход, профиль пользователя, объекты жилья, изображения жилья, бронирования, платёжные методы и публичную контактную заявку.
// @description Схема авторизации: вызовите `POST /auth/login`; API установит JWT в HttpOnly cookie `token`. Защищённые маршруты читают JWT из cookie.
// @description Swagger UI доступен только при `DEBUG=true`: `/swagger`, JSON спецификация — `/swagger/doc.json`.
// @contact.name KeyFreeStay API Support
// @contact.email support@keyfreestay.local
// @BasePath /api
// @schemes http
// @securityDefinitions.apikey CookieAuth
// @in header
// @name Cookie
// @description Cookie авторизации. Формат заголовка: Cookie: token={jwt}
func main() {
	config, err := apiserver.NewConfig()
	if err != nil {
		panic(err)
	}

	s, err := apiserver.New(config)
	if err != nil {
		panic(err)
	}

	if err := s.Start(); err != nil {
		panic(err)
	}
}
