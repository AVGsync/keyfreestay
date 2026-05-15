package apiserver

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	_ "github.com/AVGsync/keyfreestay/backend/docs"
	"github.com/AVGsync/keyfreestay/backend/internal/infrastructure/security"
	"github.com/AVGsync/keyfreestay/backend/internal/infrastructure/telegram"
	"github.com/AVGsync/keyfreestay/backend/internal/repository/minio"
	"github.com/AVGsync/keyfreestay/backend/internal/repository/postgres"
	"github.com/AVGsync/keyfreestay/backend/internal/service"
	"github.com/AVGsync/keyfreestay/backend/internal/transport/http/handler"
	"github.com/AVGsync/keyfreestay/backend/internal/transport/http/middleware"

	"github.com/go-chi/chi/v5"
	httpSwagger "github.com/swaggo/http-swagger"
)

type APIServer struct {
	config *Config
	logger *slog.Logger
	router *chi.Mux
	db     *postgres.DB
	s3     *minio.S3
	tg 		 *telegram.Client
	cancel context.CancelFunc
}

func New(config *Config) (*APIServer, error) {
	logger, err := newLogger(config)
	if err != nil {
		return nil, fmt.Errorf("apiserver: configure logger: %w", err)
	}

	return &APIServer{
		config: config,
		logger: logger,
		router: chi.NewRouter(),
	}, nil
}

func (s *APIServer) Start() error {
	if err := s.configureDB(); err != nil {
		return fmt.Errorf("apiserver: configure database: %w", err)
	}

	if err := s.configureS3(); err != nil {
		return fmt.Errorf("apiserver: configure s3: %w", err)
	}

	s.configureTelegram()

	s.configureRouter()

	slog.Info("Starting api server",
		"bind_addr", s.config.BindAddr,
		"log_level", s.config.LogLevel,
		"debug", s.config.Debug,
	)

	return http.ListenAndServe(fmt.Sprintf(":%s", s.config.BindAddr), s.router)
}

func newLogger(cfg *Config) (*slog.Logger, error) {
	levelStr := cfg.LogLevel

	if cfg.Debug {
		levelStr = "debug"
	}

	var level slog.Level
	if err := level.UnmarshalText([]byte(levelStr)); err != nil {
		return nil, fmt.Errorf("unknown log level %q: %w", levelStr, err)
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: level,
	}))
	slog.SetDefault(logger)
	return logger, nil
}

func (s *APIServer) configureDB() error {
	s.db = postgres.New(s.config.DatabaseURL())

	if err := s.db.Open(); err != nil {
		return fmt.Errorf("open database connection: %w", err)
	}
	return nil
}

func (s *APIServer) configureS3() error {
    s3, err := minio.New(
        s.config.EndPoint,
        s.config.PublicURL,
        s.config.MinioAccessKey,
        s.config.MinioSecretKey,
        "housing",
        s.config.UseSSL,
    )
    if err != nil {
        return fmt.Errorf("init s3: %w", err)
    }
    s.s3 = s3
    return nil
}

func (s *APIServer) configureTelegram() {
	s.tg = telegram.NewClient(s.config.TgBotToken)
}

func (s *APIServer) configureRouter() {
	hasher := security.NewHasher()
	jwtManager := security.NewJWTManager(s.config.JWTSecret, time.Duration(s.config.TTLAccessToken)*time.Second)

	userRepo := s.db.User()
	housingRepo := s.db.Housing()
	bookingRepo := s.db.Booking()
	paymentRepo := s.db.PaymentMethod()

	userService := service.NewUserService(userRepo, hasher, jwtManager)
	housingService := service.NewHousingService(housingRepo, s.s3)
	bookingService := service.NewBookingService(bookingRepo)
	paymentService := service.NewPaymentMethodService(paymentRepo)

	userHandler := handler.NewUserHandler(userService)
	housingHandler := handler.NewHousingHandler(housingService)
	bookingHandler := handler.NewBookingHandler(bookingService)
	paymentHandler := handler.NewPaymentMethodHandler(paymentService)

	middleware := middleware.NewMiddleware(jwtManager)

	// Telegram
	subscriberRepo := s.db.TgSubscriber()
	contactService := service.NewContactService(s.tg, subscriberRepo)
	contactHandler := handler.NewContactHandler(contactService)

	ctx, cancel := context.WithCancel(context.Background())
	s.cancel = cancel
	poller := telegram.NewPoller(s.tg, subscriberRepo)
	go poller.Run(ctx)

	if s.config.Debug {
		s.router.Get("/swagger", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, "/swagger/index.html", http.StatusMovedPermanently)
		})
		s.router.Get("/swagger/*", httpSwagger.WrapHandler)
		slog.Debug("swagger UI enabled", "url", fmt.Sprintf("http://localhost:%s/swagger/index.html", s.config.BindAddr))
	}

	s.router.Route("/api", func(r chi.Router) {
		r.Use(middleware.CORS)
		r.Use(middleware.Trace)

		r.Get("/ping", ping)

		// Contact
		r.Post("/contact", contactHandler.SendContactRequest())

		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", userHandler.RegisterNewUser())
			r.Post("/login", userHandler.LoginUser())
		})

		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth)
			
			// User
			r.Get("/me", userHandler.GetMe())
			r.Patch("/me", userHandler.UpdateUser())

			// Housing
			r.Get("/housing", housingHandler.GetHousingList())
			r.Get("/housing/{id}", housingHandler.GetHousingByID())
			r.Post("/housing", housingHandler.CreateHousing())
			r.Patch("/housing", housingHandler.UpdateHousing())
			r.Delete("/housing", housingHandler.DeleteHousing())
			
			// Image housing
			r.Post("/housing/{id}/images", housingHandler.UploadImage())
			r.Delete("/housing/{id}/images", housingHandler.DeleteImage())
			
			// Booking
			r.Get("/booking", bookingHandler.GetBookingList())
			r.Get("/booking/{id}", bookingHandler.GetBookingByID())
			r.Put("/booking/create", bookingHandler.CreateBooking())
			r.Delete("/booking/{id}", bookingHandler.DeleteBooking()) 
			
			// Payment method
			r.Get("/payments", paymentHandler.GetPaymentMethodList())
			r.Put("/payments/create", paymentHandler.CreatePaymentMethod())
			r.Delete("/payments/{id}", paymentHandler.DeletePaymentMethod())  
		})
	})
}

// ping godoc
//
// @Summary Проверить доступность API сервера
// @Description Лёгкая публичная проверка маршрутизации API сервера.
// @Description Возвращает `pong`, если HTTP-сервер запущен и маршрут доступен.
// @Description Не проверяет доступность PostgreSQL, S3/MinIO и Telegram.
// @Tags Система
// @Produce plain
// @Success 200 {string} string "pong"
// @Router /ping [get]
func ping(w http.ResponseWriter, _ *http.Request) {
	w.Write([]byte("pong"))
}
