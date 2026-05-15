package service

import (
	"context"
	"fmt"
	"html"
	"log/slog"

	"github.com/AVGsync/keyfreestay/backend/internal/model"
)

type TelegramSender interface {
	SendToChat(chatID int64, text string) error
}

type SubscriberLister interface {
	GetAll(ctx context.Context) ([]int64, error)
}

type ContactService struct {
	tg          TelegramSender
	subscribers SubscriberLister
}

func NewContactService(tg TelegramSender, subscribers SubscriberLister) *ContactService {
	return &ContactService{
		tg:          tg,
		subscribers: subscribers,
	}
}

func (s *ContactService) SendContactRequest(contact *model.ContactRequest, ctx context.Context) error {
	msg := fmt.Sprintf(
		"<b>📬 Новая заявка!</b>\n\n<b>Имя:</b> %s\n<b>Email:</b> %s\n<b>Телефон:</b> %s",
		html.EscapeString(contact.Name),
		html.EscapeString(contact.Email),
		html.EscapeString(contact.Phone),
	)

	chats, err := s.subscribers.GetAll(ctx)
	if err != nil {
		slog.Debug("Error get subscribers", "error", err)
		return err
	}

	if len(chats) == 0 {
		slog.Warn("no tg subscribers — заявка не отправлена никому", "name", contact.Name)
		return nil
	}

	for _, chatID := range chats {
		if err := s.tg.SendToChat(chatID, msg); err != nil {
			// один заблочил бота → не блокируем остальных
			slog.Warn("failed to send to chat", "chat_id", chatID, "error", err)
			continue
		}
	}
	return nil
}