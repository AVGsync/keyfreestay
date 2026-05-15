package service

import (
	"context"
	"log/slog"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
)

type BookingRepository interface {
	CreateBooking(booking *request.CreateBookingRequest, userID string, ctx context.Context) (response.BookingResponse, error)
	GetBookingByID(bookingID string, userID string, ctx context.Context) (response.BookingResponse, error)
	GetBookingListByUser(userID string, ctx context.Context) (response.BookingListResponse, error)
	DeleteBooking(bookingID string, userID string, ctx context.Context) error
}

type BookingService struct {
	repository BookingRepository
}

func NewBookingService(repository BookingRepository) *BookingService {
	return &BookingService{
		repository: repository,
	}
}

func (s *BookingService) CreateBooking(booking *request.CreateBookingRequest, ctx context.Context) (response.BookingResponse, error) {
	userID := ctx.Value("claims").(*model.Claims).UserID

	b, err := s.repository.CreateBooking(booking, userID, ctx)
	if err != nil {
		slog.Debug("Error create booking", "error", err)
		return response.BookingResponse{}, err
	}
	return b, nil
}

func (s *BookingService) GetBookingByID(bookingID string, ctx context.Context) (response.BookingResponse, error) {
	userID := ctx.Value("claims").(*model.Claims).UserID

	b, err := s.repository.GetBookingByID(bookingID, userID, ctx)
	if err != nil {
		slog.Debug("Error get booking by id", "error", err)
		return response.BookingResponse{}, err
	}
	return b, nil
}

func (s *BookingService) GetBookingList(ctx context.Context) (response.BookingListResponse, error) {
	userID := ctx.Value("claims").(*model.Claims).UserID

	res, err := s.repository.GetBookingListByUser(userID, ctx)
	if err != nil {
		slog.Debug("Error get booking list", "error", err)
		return response.BookingListResponse{}, err
	}
	return res, nil
}

func (s *BookingService) DeleteBooking(bookingID string, ctx context.Context) error {
	userID := ctx.Value("claims").(*model.Claims).UserID

	if err := s.repository.DeleteBooking(bookingID, userID, ctx); err != nil {
		slog.Debug("Error delete booking", "error", err)
		return err
	}
	return nil
}