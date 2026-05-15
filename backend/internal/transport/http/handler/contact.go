package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
)

type ContactUseCase interface {
	SendContactRequest(contact *model.ContactRequest, ctx context.Context) error
}

type ContactHandler struct {
	useCase ContactUseCase
}

func NewContactHandler(useCase ContactUseCase) *ContactHandler {
	return &ContactHandler{
		useCase: useCase,
	}
}

// SendContactRequest godoc
//
// @Summary Отправить контактную заявку
// @Description Принимает публичную заявку с именем, email и телефоном.
// @Description Заявка отправляется подписчикам Telegram-бота. Если подписчиков нет, запрос всё равно считается успешным.
// @Description Авторизация не требуется.
// @Tags Контактные заявки
// @Accept json
// @Produce plain
// @Param request body model.ContactRequest true "Контактные данные заявителя"
// @Success 200 {string} string "Пустой ответ со статусом 200"
// @Failure 400 {string} string "invalid request body — тело запроса не JSON или структура не совпадает со схемой"
// @Failure 500 {string} string "failed to send contact request — не удалось получить подписчиков или отправить заявку"
// @Router /contact [post]
func (h *ContactHandler) SendContactRequest() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		contact := &model.ContactRequest{}
		if err := json.NewDecoder(r.Body).Decode(contact); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		if err := h.useCase.SendContactRequest(contact, r.Context()); err != nil {
			http.Error(w, "failed to send contact request", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
