package repository

import (
	"context"
	"eamagineweather-backend/db"
)

type WeatherRepository struct {
	db *db.PrismaClient
}

func NewWeatherRepository(database *db.PrismaClient) *WeatherRepository {
	return &WeatherRepository{db: database}
}

func (r *WeatherRepository) FindByRegionCode(ctx context.Context, regionCode string) ([]db.WeatherDataModel, error) {
	region, err := r.db.Region.FindFirst(
		db.Region.Code.Equals(regionCode),
	).Exec(ctx)
	
	if err != nil {
		return nil, err
	}

	return r.db.WeatherData.FindMany(
		db.WeatherData.RegionID.Equals(region.ID),
	).OrderBy(
		db.WeatherData.UtcDatetime.Order(db.SortOrderDesc),
	).Take(24).Exec(ctx) // Last 24 hours of data
}

func (r *WeatherRepository) Create(ctx context.Context, regionID string, temp float64, humidity int, desc string) (*db.WeatherDataModel, error) {
	// Simplified create for now
	return nil, nil
}