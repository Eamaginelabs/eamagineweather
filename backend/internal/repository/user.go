package repository

import (
	"context"
	"eamagine-weather-backend/db"
)

type UserRepository struct {
	db *db.PrismaClient
}

func NewUserRepository(database *db.PrismaClient) *UserRepository {
	return &UserRepository{db: database}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*db.UserModel, error) {
	return r.db.User.FindFirst(
		db.User.Email.Equals(email),
	).Exec(ctx)
}

func (r *UserRepository) Create(ctx context.Context, email string, name string) (*db.UserModel, error) {
	// Simplified create for now
	return nil, nil
}

func (r *UserRepository) Update(ctx context.Context, id string, name string) (*db.UserModel, error) {
	// Simplified update for now
	return nil, nil
}