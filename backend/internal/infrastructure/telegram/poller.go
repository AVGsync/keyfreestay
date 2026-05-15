package telegram

import (
	"context"
	"log/slog"
	"time"
)

type SubscriberStore interface {
	Add(chatID int64, username, firstName string, ctx context.Context) error
	Delete(chatID int64, ctx context.Context) error
}

type Poller struct {
	client *Client
	store  SubscriberStore
}

func NewPoller(client *Client, store SubscriberStore) *Poller {
	return &Poller{
		client: client,
		store:  store,
	}
}

func (p *Poller) Run(ctx context.Context) {
	var offset int64

	for {
		select {
		case <-ctx.Done():
			slog.Info("telegram poller stopped")
			return
		default:
		}

		updates, err := p.client.GetUpdates(offset)
		if err != nil {
			slog.Warn("tg get updates failed", "error", err)
			time.Sleep(5 * time.Second)
			continue
		}

		for _, u := range updates {
			offset = u.UpdateID + 1

			if u.Message == nil || u.Message.Chat.Type != "private" {
				continue
			}

			chatID := u.Message.Chat.ID
			text := u.Message.Text

			switch text {
			case "/start":
				if err := p.store.Add(chatID, u.Message.Chat.Username, u.Message.Chat.FirstName, ctx); err != nil {
					slog.Warn("tg add subscriber failed", "error", err)
					continue
				}
				_ = p.client.SendToChat(chatID, "✅ Подписан на уведомления о новых заявках.\nКоманда /stop — отписаться.")
				slog.Info("new tg subscriber", "chat_id", chatID, "username", u.Message.Chat.Username)

			case "/stop":
				if err := p.store.Delete(chatID, ctx); err != nil {
					slog.Warn("tg delete subscriber failed", "error", err)
					continue
				}
				_ = p.client.SendToChat(chatID, "❎ Отписан. Чтобы вернуться — /start.")
			}
		}
	}
}