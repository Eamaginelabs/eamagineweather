package database

import (
	"context"
	"eamagine-weather-backend/db"

	"github.com/redis/go-redis/v9"
)

type Database struct {
	Client *db.PrismaClient
}

func NewConnection(databaseURL string) (*Database, error) {
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		return nil, err
	}

	return &Database{Client: client}, nil
}

func (d *Database) Disconnect() {
	if err := d.Client.Prisma.Disconnect(); err != nil {
		// Log error but don't panic on disconnect
	}
}

func NewRedisClient(redisURL string) *redis.Client {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		// Fallback to default Redis configuration
		opt = &redis.Options{
			Addr: "localhost:6379",
			DB:   0,
		}
	}

	client := redis.NewClient(opt)
	
	// Test connection
	ctx := context.Background()
	_, err = client.Ping(ctx).Result()
	if err != nil {
		// Log warning but continue without Redis
		return nil
	}

	return client
}