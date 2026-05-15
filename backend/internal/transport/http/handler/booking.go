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