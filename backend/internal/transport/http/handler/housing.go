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

// CreateHousing godoc
//
// @Summary Создать объект жилья
// @Description Создаёт черновик объекта жилья для текущего пользователя.
// @Description При создании можно передать тип жилья, название, описание и адрес. Остальные поля заполняются через PATCH /housing.
// @Description Новый объект принадлежит пользователю из cookie `token`.
// @Tags Жильё
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param request body request.CreateHousingRequest true "Начальные данные объекта жилья"
// @Success 200 {object} map[string]string "ID созданного объекта: {\"id\":\"550e8400-e29b-41d4-a716-446655440000\"}"
// @Failure 400 {string} string "invalid request body — тело запроса не JSON или структура не совпадает со схемой"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to create housing — объект не создан"
// @Router /housing [post]
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

// UpdateHousing godoc
//
// @Summary Обновить объект жилья
// @Description Частично обновляет объект жилья текущего пользователя.
// @Description ID объекта передаётся в query-параметре `id`. Изменять объект может только его владелец.
// @Description Для публикации (`status=published`) объект должен иметь обязательные поля: название, адрес, координаты, цену за ночь и максимум гостей.
// @Tags Жильё
// @Accept json
// @Produce plain
// @Security CookieAuth
// @Param id query string true "UUID объекта жилья" example(550e8400-e29b-41d4-a716-446655440000)
// @Param request body request.UpdateHousingRequest true "Поля объекта жилья, которые нужно изменить"
// @Success 200 {string} string "Пустой ответ со статусом 200"
// @Failure 400 {string} string "missing housing ID / invalid request body — не передан id или тело запроса некорректно"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to update housing — объект не найден, не принадлежит пользователю или не прошёл ограничения БД"
// @Router /housing [patch]
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

// GetHousingByID godoc
//
// @Summary Получить объект жилья по ID
// @Description Возвращает полную карточку объекта жилья с параметрами, рейтингом и списком изображений.
// @Description Для каждого изображения сервис формирует публичный URL из storage key.
// @Tags Жильё
// @Produce json
// @Security CookieAuth
// @Param id path string true "UUID объекта жилья" example(550e8400-e29b-41d4-a716-446655440000)
// @Success 200 {object} model.HousingResponse "Полная карточка объекта жилья"
// @Failure 400 {string} string "missing housing ID — id не передан в path"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to get housing — объект не найден или произошла внутренняя ошибка"
// @Router /housing/{id} [get]
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

// GetHousingList godoc
//
// @Summary Получить список объектов жилья
// @Description Возвращает список объектов жилья, доступный текущему пользователю.
// @Description Пользователь с ролью `user` получает только опубликованные объекты. Владелец/администратор получает свои объекты.
// @Description В списке возвращается краткая карточка и публичный URL первого изображения, если изображение есть.
// @Tags Жильё
// @Produce json
// @Security CookieAuth
// @Success 200 {object} response.HousingListResponse "Список объектов жилья"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to get housing list — список не получен"
// @Router /housing [get]
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

// DeleteHousing godoc
//
// @Summary Удалить объект жилья
// @Description Удаляет объект жилья текущего пользователя по query-параметру `id`.
// @Description Удалять объект может только владелец. После удаления сервис также удаляет связанные изображения из S3/MinIO.
// @Tags Жильё
// @Produce plain
// @Security CookieAuth
// @Param id query string true "UUID объекта жилья" example(550e8400-e29b-41d4-a716-446655440000)
// @Success 200 {string} string "Пустой ответ со статусом 200"
// @Failure 400 {string} string "missing housing ID — id не передан"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to delete housing — объект не найден, не принадлежит пользователю или не удалён"
// @Router /housing [delete]
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

// UploadImage godoc
//
// @Summary Загрузить изображения объекта жилья
// @Description Загружает одно или несколько изображений для объекта жилья текущего пользователя.
// @Description ID объекта передаётся в path. Файлы передаются через multipart-поле `file`; поле можно повторять для нескольких файлов.
// @Description Разрешены MIME-типы `image/jpeg`, `image/png`, `image/webp`. Порядок изображений назначается автоматически.
// @Tags Изображения жилья
// @Accept multipart/form-data
// @Produce plain
// @Security CookieAuth
// @Param id path string true "UUID объекта жилья" example(550e8400-e29b-41d4-a716-446655440000)
// @Param file formData file true "Изображение жилья; можно передать несколько частей с именем `file`"
// @Success 200 {string} string "Пустой ответ со статусом 200"
// @Failure 400 {string} string "missing housing ID / too large or bad multipart / file required / one of files too large / only jpeg/png/webp allowed — ошибка параметров или файла"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "cannot read file / failed to upload image — файл не прочитан, не загружен или объект не принадлежит пользователю"
// @Router /housing/{id}/images [post]
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

// DeleteImage godoc
//
// @Summary Удалить изображение объекта жилья
// @Description Удаляет изображение из S3/MinIO и запись о нём в БД.
// @Description ID объекта передаётся в path, storage key изображения — в query-параметре `key`.
// @Description Удалять изображение может только владелец объекта жилья.
// @Tags Изображения жилья
// @Produce plain
// @Security CookieAuth
// @Param id path string true "UUID объекта жилья" example(550e8400-e29b-41d4-a716-446655440000)
// @Param key query string true "Storage key изображения в S3/MinIO" example(/housing/550e8400-e29b-41d4-a716-446655440000/7a45d9c2-0000-4000-9000-123456789abc.jpg)
// @Success 200 {string} string "Пустой ответ со статусом 200"
// @Failure 400 {string} string "missing image key / missing housing ID — не передан key или id"
// @Failure 401 {string} string "unauthorized — cookie `token` отсутствует, просрочена или недействительна"
// @Failure 500 {string} string "failed to delete image — изображение не найдено, объект не принадлежит пользователю или удаление не выполнено"
// @Router /housing/{id}/images [delete]
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
