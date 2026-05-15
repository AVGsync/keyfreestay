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