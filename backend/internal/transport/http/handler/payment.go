package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
	"github.com/go-chi/chi/v5"
)

type PaymentMethodUseCase interface {
	CreatePaymentMethod(payment *request.CreatePaymentMethodRequest, ctx context.Context) (response.PaymentMethodResponse, error)
	GetPaymentMethodList(ctx context.Context) (response.PaymentMethodListResponse, error)
	DeletePaymentMethod(paymentID string, ctx context.Context) error
}

type PaymentMethodHandler struct {
	useCase PaymentMethodUseCase
}

func NewPaymentMethodHandler(useCase PaymentMethodUseCase) *PaymentMethodHandler {
	return &PaymentMethodHandler{
		useCase: useCase,
	}
}

// CreatePaymentMethod godoc
//
// @Summary Добавить платёжный метод
// @Description Создаёт платёжный метод текущего пользователя.
// @Description API хранит только безопасные карточные данные: последние 4 цифры, бренд, срок действия, имя держателя и флаг основного метода.
// @Description Если `is_default=true`, текущий основной метод пользователя сбрасывается.
// @Tags Платёжные методы
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param request body request.CreatePaymentMethodRequest true "Данные платёжного метода"
// @Success 200 {object} response.PaymentMethodResponse "Созданный платёжный метод"
// @Failure 400 {string} string "invalid request body — тело запроса не JSON или структура не совпадает со схемой"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to create payment method — платёжный метод не создан"
// @Router /payments/create [put]
func (h *PaymentMethodHandler) CreatePaymentMethod() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		payment := &request.CreatePaymentMethodRequest{}
		if err := json.NewDecoder(r.Body).Decode(payment); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		p, err := h.useCase.CreatePaymentMethod(payment, r.Context())
		if err != nil {
			http.Error(w, "failed to create payment method", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(p)
	}
}

// GetPaymentMethodList godoc
//
// @Summary Получить список платёжных методов
// @Description Возвращает платёжные методы текущего пользователя.
// @Description Список отсортирован так, что основной метод (`is_default=true`) идёт первым, затем более новые методы.
// @Tags Платёжные методы
// @Produce json
// @Security CookieAuth
// @Success 200 {object} response.PaymentMethodListResponse "Список платёжных методов пользователя"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to get payment method list — список не получен"
// @Router /payments [get]
func (h *PaymentMethodHandler) GetPaymentMethodList() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		list, err := h.useCase.GetPaymentMethodList(r.Context())
		if err != nil {
			http.Error(w, "failed to get payment method list", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(list)
	}
}

// DeletePaymentMethod godoc
//
// @Summary Удалить платёжный метод
// @Description Удаляет платёжный метод текущего пользователя по ID.
// @Description Пользователь может удалить только свой платёжный метод.
// @Tags Платёжные методы
// @Produce plain
// @Security CookieAuth
// @Param id path string true "UUID платёжного метода" example(550e8400-e29b-41d4-a716-446655440000)
// @Success 200 {string} string "Пустой ответ со статусом 200"
// @Failure 400 {string} string "missing payment method ID — id не передан в path"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to delete payment method — платёжный метод не найден, не принадлежит пользователю или не удалён"
// @Router /payments/{id} [delete]
func (h *PaymentMethodHandler) DeletePaymentMethod() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		paymentID := chi.URLParam(r, "id")
		if paymentID == "" {
			http.Error(w, "missing payment method ID", http.StatusBadRequest)
			return
		}

		if err := h.useCase.DeletePaymentMethod(paymentID, r.Context()); err != nil {
			http.Error(w, "failed to delete payment method", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
