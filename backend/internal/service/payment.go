package service

import (
	"context"
	"log/slog"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
	"github.com/AVGsync/keyfreestay/backend/internal/model/request"
	"github.com/AVGsync/keyfreestay/backend/internal/model/response"
)

type PaymentMethodRepository interface {
	CreatePaymentMethod(payment *request.CreatePaymentMethodRequest, userID string, ctx context.Context) (response.PaymentMethodResponse, error)
	GetPaymentMethodListByUser(userID string, ctx context.Context) (response.PaymentMethodListResponse, error)
	DeletePaymentMethod(paymentID string, userID string, ctx context.Context) error
}

type PaymentMethodService struct {
	repository PaymentMethodRepository
}

func NewPaymentMethodService(repository PaymentMethodRepository) *PaymentMethodService {
	return &PaymentMethodService{
		repository: repository,
	}
}

func (s *PaymentMethodService) CreatePaymentMethod(payment *request.CreatePaymentMethodRequest, ctx context.Context) (response.PaymentMethodResponse, error) {
	userID := ctx.Value("claims").(*model.Claims).UserID

	p, err := s.repository.CreatePaymentMethod(payment, userID, ctx)
	if err != nil {
		slog.Debug("Error create payment method", "error", err)
		return response.PaymentMethodResponse{}, err
	}
	return p, nil
}

func (s *PaymentMethodService) GetPaymentMethodList(ctx context.Context) (response.PaymentMethodListResponse, error) {
	userID := ctx.Value("claims").(*model.Claims).UserID

	res, err := s.repository.GetPaymentMethodListByUser(userID, ctx)
	if err != nil {
		slog.Debug("Error get payment method list", "error", err)
		return response.PaymentMethodListResponse{}, err
	}
	return res, nil
}

func (s *PaymentMethodService) DeletePaymentMethod(paymentID string, ctx context.Context) error {
	userID := ctx.Value("claims").(*model.Claims).UserID

	if err := s.repository.DeletePaymentMethod(paymentID, userID, ctx); err != nil {
		slog.Debug("Error delete payment method", "error", err)
		return err
	}
	return nil
}