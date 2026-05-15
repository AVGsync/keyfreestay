package service

import (
	"context"
	"fmt"
	"io"
	"log/slog"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
	"github.com/google/uuid"
)

type HousingRepository interface {
	CreateHousing(housing *request.CreateHousingRequest, userID string, ctx context.Context) (string, error)
	UpdateHousing(housing *request.UpdateHousingRequest, housingID string, userID string, ctx context.Context) error
	GetHousingByID(housingID string, ctx context.Context) (model.HousingResponse, error)
	GetHousingListForUser(ctx context.Context) (response.HousingListResponse, error)
	GetHousingListForOwner(userID string, ctx context.Context) (response.HousingListResponse, error)
	DeleteHousing(housingID string, ctx context.Context) error
	AddImage(ctx context.Context, housingID string, userID string, key string) (model.HousingImage, error)
	DeleteImage(ctx context.Context, key string) error
}

type S3 interface {
	Upload(ctx context.Context, key string, reader io.Reader, size int64, contentType string) error
	Delete(ctx context.Context, key string) error
	PublicURL(key string) string
}

type HousingService struct {
	repository HousingRepository
	s3 S3
}

func NewHousingService(repository HousingRepository, s3 S3) *HousingService {
	return &HousingService{
		repository: repository,
		s3: s3,
	}
}

func (s *HousingService) CreateHousing(housing *request.CreateHousingRequest, ctx context.Context) (string, error) {
	userID := ctx.Value("claims").(*model.Claims).UserID

	id, err := s.repository.CreateHousing(housing, userID, ctx)
	if err != nil {
		slog.Debug("Error create housing", "error", err)
		return "", err
	}
	return id, err
}

func (s *HousingService) UpdateHousing(housing *request.UpdateHousingRequest, housingID string, ctx context.Context) error {
	userID := ctx.Value("claims").(*model.Claims).UserID
	h, err := s.repository.GetHousingByID(housingID, ctx)

	if err != nil {
		slog.Debug("Error get housing by id", "error", err)
		return err
	}

	if h.UserID != userID {
		slog.Debug("user is not owner of housing", "user_id", userID, "housing_id", housingID)
		return fmt.Errorf("user is not owner of housing")
	}
	
	err = s.repository.UpdateHousing(housing, housingID, userID, ctx)
	if err != nil {
		slog.Debug("Error update housing", "error", err)
		return err
	}
	return nil
}

func (s *HousingService) GetHousingByID(housingID string, ctx context.Context) (model.HousingResponse, error) {
	h, err := s.repository.GetHousingByID(housingID, ctx)

	for i := range h.Images {
		url := s.s3.PublicURL(h.Images[i].StorageKey)
		h.Images[i].ImageURL = &url
	}

	if err != nil {
		slog.Debug("Error get housing by id", "error", err)
		return model.HousingResponse{}, err
	}
	return h, nil
}

func (s *HousingService) GetHousingList(ctx context.Context) (response.HousingListResponse, error) {
	if ctx.Value("claims").(*model.Claims).Role == "user" {
			res , err := s.repository.GetHousingListForUser(ctx)
			if err != nil {
				slog.Debug("Error get housing list for user", "error", err)
				return response.HousingListResponse{}, err
			}

			for i := range res.Items {
				if res.Items[i].ThumbnailURL != nil {
					url := s.s3.PublicURL(*res.Items[i].ThumbnailURL)
					res.Items[i].ThumbnailURL = &url
				}
			}

			return res, nil
	}

	userID := ctx.Value("claims").(*model.Claims).UserID
	res , err := s.repository.GetHousingListForOwner(userID, ctx)
	if err != nil {
		slog.Debug("Error get housing list for owner", "error", err)
		return response.HousingListResponse{}, err
	}
	return res, nil
}

func (s *HousingService) DeleteHousing(housingID string, ctx context.Context) error {
	userID := ctx.Value("claims").(*model.Claims).UserID

	house, err := s.repository.GetHousingByID(housingID, ctx)
	if err != nil {
		slog.Debug("get housing by id", "error", err)
		return err
	}

	if house.UserID != userID {
		slog.Debug("user is not owner of housing", "user_id", userID, "housing_id", housingID)
		return fmt.Errorf("user is not owner of housing")
	}

	err = s.repository.DeleteHousing(housingID, ctx)
	if err != nil {
		slog.Debug("delete housing", "error", err)
		return err
	}

	for _, img := range house.Images {
		err = s.s3.Delete(ctx, img.StorageKey)
		if err != nil {
			slog.Debug("delete from s3", "error", err)
			return err
		}
	}

	return nil

}

func (s *HousingService) UploadImage(ctx context.Context, housingID string, reader io.Reader, size int64, contentType string) error {
	userID := ctx.Value("claims").(*model.Claims).UserID

	ext := ".jpg"
	switch contentType {
	case "image/png":
		ext = ".png"
	case "image/webp":
		ext = ".webp"
	}
	key := fmt.Sprintf("/housing/%s/%s%s", housingID, uuid.NewString(), ext)

	if err := s.s3.Upload(ctx, key, reader, size, contentType); err != nil {
		slog.Debug("upload to s3", "error", err)
		return err
	}

	_, err := s.repository.AddImage(ctx, housingID, userID, key)
	if err != nil {
		_ = s.s3.Delete(ctx, key)
		slog.Debug("save image meta", "error", err)
		return err
	}

	return nil
}

func (s *HousingService) DeleteImage(ctx context.Context, key string, housingID string) error {
	userID := ctx.Value("claims").(*model.Claims).UserID

	house, err := s.repository.GetHousingByID(housingID, ctx)
	if err != nil {
		slog.Debug("get housing by id", "error", err)
		return err
	}

	if house.UserID != userID {
		slog.Debug("user is not owner of housing", "user_id", userID, "housing_id", housingID)
		return fmt.Errorf("user is not owner of housing")
	}

	err = s.s3.Delete(ctx, key)
	if err != nil {
		slog.Debug("delete from s3", "error", err)
		return err
	}

	err = s.repository.DeleteImage(ctx, key)
	if err != nil {
		slog.Debug("delete image from repository", "error", err)
		return err
	}
	return nil
}
