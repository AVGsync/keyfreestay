package telegram

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Client struct {
	token string
	http  *http.Client
}

func NewClient(token string) *Client {
	return &Client{
		token: token,
		http:  &http.Client{Timeout: 35 * time.Second}, // > long-poll timeout
	}
}

type Update struct {
	UpdateID int64    `json:"update_id"`
	Message  *Message `json:"message,omitempty"`
}

type Message struct {
	Chat Chat   `json:"chat"`
	Text string `json:"text"`
}

type Chat struct {
	ID        int64  `json:"id"`
	Username  string `json:"username,omitempty"`
	FirstName string `json:"first_name,omitempty"`
	Type      string `json:"type"`
}

type updatesResponse struct {
	OK     bool     `json:"ok"`
	Result []Update `json:"result"`
}

func (c *Client) GetUpdates(offset int64) ([]Update, error) {
	url := fmt.Sprintf(
		"https://api.telegram.org/bot%s/getUpdates?offset=%d&timeout=30",
		c.token, offset,
	)
	resp, err := c.http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("telegram: get updates: %w", err)
	}
	defer resp.Body.Close()

	var ur updatesResponse
	if err := json.NewDecoder(resp.Body).Decode(&ur); err != nil {
		return nil, fmt.Errorf("telegram: decode updates: %w", err)
	}
	return ur.Result, nil
}

func (c *Client) SendToChat(chatID int64, text string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", c.token)

	body, _ := json.Marshal(map[string]any{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "HTML",
	})

	resp, err := c.http.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("telegram: send: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram: bad status %d", resp.StatusCode)
	}
	return nil
}