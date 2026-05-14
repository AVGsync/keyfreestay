package service

import (
	"context"
	"io"
	"log/slog"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
)

type HousingRepository interface {
	CreateHousing(housing *request.CreateHousingRequest, userID string, ctx context.Context) (string, error)
	UpdateHousing(housing *request.UpdateHousingRequest, housingID string, userID string, ctx context.Context) error
	GetHousingByID(housingID string, ctx context.Context) (model.HousingResponse, error)
	GetHousingListForUser(ctx context.Context) (response.HousingListResponse, error)
	GetHousingListForOwner(userID string, ctx context.Context) (response.HousingListResponse, error)
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
	
	err := s.repository.UpdateHousing(housing, housingID, userID, ctx)
	if err != nil {
		slog.Debug("Error update housing", "error", err)
		return err
	}
	return nil
}

func (s *HousingService) GetHousingByID(housingID string, ctx context.Context) (model.HousingResponse, error) {
	h, err := s.repository.GetHousingByID(housingID, ctx)
  // Написать функцию для получения фото жилья по ID и добавить в модель ответа
	// h.Images = s.getHousingImages(housingID, ctx)

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