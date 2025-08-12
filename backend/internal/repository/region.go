package repository

import (
	"context"
	"eamagineweather-backend/db"
)

type RegionRepository struct {
	db *db.PrismaClient
}

func NewRegionRepository(database *db.PrismaClient) *RegionRepository {
	return &RegionRepository{db: database}
}

func (r *RegionRepository) FindByCode(ctx context.Context, code string) (*db.RegionModel, error) {
	return r.db.Region.FindFirst(
		db.Region.Code.Equals(code),
		db.Region.IsActive.Equals(true),
	).Exec(ctx)
}

func (r *RegionRepository) FindPopular(ctx context.Context, limit int) ([]db.RegionModel, error) {
	return r.db.Region.FindMany(
		db.Region.HasWeatherData.Equals(true),
		db.Region.IsActive.Equals(true),
	).Take(limit).Exec(ctx)
}