package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
	"github.com/go-chi/chi/v5"
)

type BookingUseCase interface {
	CreateBooking(booking *request.CreateBookingRequest, ctx context.Context) (response.BookingResponse, error)
	GetBookingByID(bookingID string, ctx context.Context) (response.BookingResponse, error)
	GetBookingList(ctx context.Context) (response.BookingListResponse, error)
	DeleteBooking(bookingID string, ctx context.Context) error
}

type BookingHandler struct {
	useCase BookingUseCase
}

func NewBookingHandler(useCase BookingUseCase) *BookingHandler {
	return &BookingHandler{
		useCase: useCase,
	}
}

// CreateBooking godoc
//
// @Summary Создать бронирование
// @Description Создаёт бронирование опубликованного объекта жилья для текущего пользователя.
// @Description Объект должен быть опубликован, вместимость должна быть не меньше `guests_count`, даты не должны пересекаться с активными бронированиями.
// @Description Стоимость рассчитывается сервером: цена за ночь на момент бронирования * количество ночей + сервисный сбор.
// @Tags Бронирования
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param request body request.CreateBookingRequest true "Данные бронирования"
// @Success 200 {object} response.BookingResponse "Созданное бронирование"
// @Failure 400 {string} string "invalid request body — тело запроса не JSON или структура не совпадает со схемой"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to create booking — объект не найден, не опубликован, занят, не подходит по гостям или БД отклонила запрос"
// @Router /booking/create [put]
func (h *BookingHandler) CreateBooking() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		booking := &request.CreateBookingRequest{}
		if err := json.NewDecoder(r.Body).Decode(booking); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		b, err := h.useCase.CreateBooking(booking, r.Context())
		if err != nil {
			http.Error(w, "failed to create booking", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(b)
	}
}

// GetBookingByID godoc
//
// @Summary Получить бронирование по ID
// @Description Возвращает бронирование текущего пользователя.
// @Description Пользователь может получить только своё бронирование.
// @Tags Бронирования
// @Produce json
// @Security CookieAuth
// @Param id path string true "UUID бронирования" example(550e8400-e29b-41d4-a716-446655440000)
// @Success 200 {object} response.BookingResponse "Детали бронирования"
// @Failure 400 {string} string "missing booking ID — id не передан в path"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to get booking — бронирование не найдено или не принадлежит пользователю"
// @Router /booking/{id} [get]
func (h *BookingHandler) GetBookingByID() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		bookingID := chi.URLParam(r, "id")
		if bookingID == "" {
			http.Error(w, "missing booking ID", http.StatusBadRequest)
			return
		}

		b, err := h.useCase.GetBookingByID(bookingID, r.Context())
		if err != nil {
			http.Error(w, "failed to get booking", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(b)
	}
}

// GetBookingList godoc
//
// @Summary Получить список бронирований
// @Description Возвращает все бронирования текущего пользователя, отсортированные по дате заезда от новых к старым.
// @Tags Бронирования
// @Produce json
// @Security CookieAuth
// @Success 200 {object} response.BookingListResponse "Список бронирований пользователя"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to get booking list — список не получен"
// @Router /booking [get]
func (h *BookingHandler) GetBookingList() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		bookingList, err := h.useCase.GetBookingList(r.Context())
		if err != nil {
			http.Error(w, "failed to get booking list", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(bookingList)
	}
}

// DeleteBooking godoc
//
// @Summary Удалить бронирование
// @Description Удаляет бронирование текущего пользователя по ID.
// @Description Пользователь может удалить только своё бронирование.
// @Tags Бронирования
// @Produce plain
// @Security CookieAuth
// @Param id path string true "UUID бронирования" example(550e8400-e29b-41d4-a716-446655440000)
// @Success 200 {string} string "Пустой ответ со статусом 200"
// @Failure 400 {string} string "missing booking ID — id не передан в path"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to delete booking — бронирование не найдено, не принадлежит пользователю или не удалено"
// @Router /booking/{id} [delete]
func (h *BookingHandler) DeleteBooking() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		bookingID := chi.URLParam(r, "id")
		if bookingID == "" {
			http.Error(w, "missing booking ID", http.StatusBadRequest)
			return
		}

		if err := h.useCase.DeleteBooking(bookingID, r.Context()); err != nil {
			http.Error(w, "failed to delete booking", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
