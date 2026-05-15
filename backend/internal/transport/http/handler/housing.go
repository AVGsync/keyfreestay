package handler

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
	"github.com/go-chi/chi/v5"
)

type HousingUseCase interface {
	CreateHousing(housing *request.CreateHousingRequest, ctx context.Context) (string, error)
	UpdateHousing(housing *request.UpdateHousingRequest, housingID string, ctx context.Context) error
	GetHousingByID(housingID string, ctx context.Context) (model.HousingResponse, error)
	GetHousingList(ctx context.Context) (response.HousingListResponse, error)
	DeleteHousing(housingID string, ctx context.Context) error
	UploadImage(ctx context.Context, housingID string, reader io.Reader, size int64, contentType string) error
	DeleteImage(ctx context.Context, key string, housingID string) error
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

func (h *HousingHandler) DeleteHousing() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		housingID := r.URL.Query().Get("id")
		if housingID == "" {
			http.Error(w, "missing housing ID", http.StatusBadRequest)
			return
		}

		if err := h.useCase.DeleteHousing(housingID, r.Context()); err != nil {
			http.Error(w, "failed to delete housing", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

const maxUploadSize = 30 << 40 

func (h *HousingHandler) UploadImage() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		housingID := chi.URLParam(r, "id")
		if housingID == "" {
			http.Error(w, "missing housing ID", http.StatusBadRequest)
			return
		}

		// общий лимит на все файлы суммарно
		r.Body = http.MaxBytesReader(w, r.Body, 10*maxUploadSize+1024)
		if err := r.ParseMultipartForm(10 * maxUploadSize); err != nil {
			http.Error(w, "too large or bad multipart", http.StatusBadRequest)
			return
		}

		files := r.MultipartForm.File["file"]
		if len(files) == 0 {
			http.Error(w, "file required", http.StatusBadRequest)
			return
		}

		for _, fh := range files {
			if fh.Size > maxUploadSize {
				http.Error(w, "one of files too large", http.StatusBadRequest)
				return
			}

			ct := fh.Header.Get("Content-Type")
			if ct != "image/jpeg" && ct != "image/png" && ct != "image/webp" {
				http.Error(w, "only jpeg/png/webp allowed", http.StatusBadRequest)
				return
			}

			f, err := fh.Open()
			if err != nil {
				http.Error(w, "cannot read file", http.StatusInternalServerError)
				return
			}

			err = h.useCase.UploadImage(r.Context(), housingID, f, fh.Size, ct)
			f.Close()
			if err != nil {
				http.Error(w, "failed to upload image", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusOK)
	}
}

func (h *HousingHandler) DeleteImage() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.URL.Query().Get("key")
		if key == "" {
			http.Error(w, "missing image key", http.StatusBadRequest)
			return
		}

		housingID := chi.URLParam(r, "id")
		if housingID == "" {
			http.Error(w, "missing housing ID", http.StatusBadRequest)
			return
		}

		err := h.useCase.DeleteImage(r.Context(), key, housingID)
		if err != nil {
			http.Error(w, "failed to delete image", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}