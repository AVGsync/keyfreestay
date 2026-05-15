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