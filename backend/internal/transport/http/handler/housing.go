package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
)

type HousingUseCase interface {
	CreateHousing(housing *request.CreateHousingRequest, ctx context.Context) (string, error)
	UpdateHousing(housing *request.UpdateHousingRequest, housingID string, ctx context.Context) error
	GetHousingByID(housingID string, ctx context.Context) (model.HousingResponse, error)
	GetHousingList(ctx context.Context) (response.HousingListResponse, error)
}

type HousingHandler struct {
	useCase HousingUseCase
}

func NewHousingHandler(useCase HousingUseCase) *HousingHandler {
	return &HousingHandler{
		useCase: useCase,
	}
}

func (h *HousingHandler) CreateHousing() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		housing := &request.CreateHousingRequest{}
		if err := json.NewDecoder(r.Body).Decode(housing); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		id, err := h.useCase.CreateHousing(housing, r.Context())
		if err != nil {
			http.Error(w, "failed to create housing", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"id": id})
	}
}

func (h *HousingHandler) UpdateHousing() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		housingID := r.URL.Query().Get("id")
		if housingID == "" {
			http.Error(w, "missing housing ID", http.StatusBadRequest)
			return
		}

		housing := &request.UpdateHousingRequest{}
		if err := json.NewDecoder(r.Body).Decode(housing); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		if err := h.useCase.UpdateHousing(housing, housingID, r.Context()); err != nil {
			http.Error(w, "failed to update housing", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func (h *HousingHandler) GetHousingByID() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		housingID := strings.Split(r.URL.String(), "/")[3]
		if housingID == "" {
			http.Error(w, "missing housing ID", http.StatusBadRequest)
			return
		}

		housing, err := h.useCase.GetHousingByID(housingID, r.Context())
		if err != nil {
			http.Error(w, "failed to get housing", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(housing)
	}
}

func (h *HousingHandler) GetHousingList() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		housingList, err := h.useCase.GetHousingList(r.Context())
		if err != nil {
			http.Error(w, "failed to get housing list", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(housingList)
	}
}