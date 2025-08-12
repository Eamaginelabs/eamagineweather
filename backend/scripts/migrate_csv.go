package main

import (
	"bufio"
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"eamagine-weather-backend/db"

	"github.com/joho/godotenv"
)

type RegionData struct {
	Code         string
	Name         string
	Level        int
	ProvinceCode *string
	ProvinceName *string
	RegencyCode  *string
	RegencyName  *string
	DistrictCode *string
	DistrictName *string
	VillageCode  *string
	VillageName  *string
}

func main() {
	// Load environment variables
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Connect to database
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer client.Prisma.Disconnect()

	ctx := context.Background()

	// Read CSV file
	file, err := os.Open("../../indonesian_regions.csv")
	if err != nil {
		log.Fatal("Error opening CSV file:", err)
	}
	defer file.Close()

	reader := csv.NewReader(bufio.NewReader(file))
	var batchSize = 500
	var totalProcessed = 0
	var batch []RegionData

	log.Println("Starting CSV processing...")

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("Error reading CSV line: %v", err)
			continue
		}

		if len(record) != 2 {
			continue
		}

		code := strings.TrimSpace(record[0])
		name := strings.TrimSpace(record[1])

		if code == "" || name == "" {
			continue
		}

		regionData := parseRegionCode(code, name)
		batch = append(batch, regionData)

		// Process batch
		if len(batch) >= batchSize {
			err := processBatch(ctx, client, batch)
			if err != nil {
				log.Printf("Error processing batch: %v", err)
			} else {
				totalProcessed += len(batch)
				log.Printf("✓ Processed batch of %d records (total: %d)", len(batch), totalProcessed)
			}
			batch = []RegionData{} // Reset batch
		}
	}

	// Process remaining records
	if len(batch) > 0 {
		err := processBatch(ctx, client, batch)
		if err != nil {
			log.Printf("Error processing final batch: %v", err)
		} else {
			totalProcessed += len(batch)
			log.Printf("✓ Processed final batch of %d records", len(batch))
		}
	}

	log.Printf("🎉 Migration completed! Total records processed: %d", totalProcessed)
}

func parseRegionCode(code, name string) RegionData {
	parts := strings.Split(code, ".")
	level := len(parts)

	regionData := RegionData{
		Code:  code,
		Name:  name,
		Level: level,
	}

	// Build hierarchical structure
	switch level {
	case 1: // Province
		regionData.ProvinceCode = &code
		regionData.ProvinceName = &name

	case 2: // Regency/City
		regionData.ProvinceCode = &parts[0]
		regionData.RegencyCode = &code
		regionData.RegencyName = &name

	case 3: // District
		regionData.ProvinceCode = &parts[0]
		regencyCode := fmt.Sprintf("%s.%s", parts[0], parts[1])
		regionData.RegencyCode = &regencyCode
		regionData.DistrictCode = &code
		regionData.DistrictName = &name

	case 4: // Village
		regionData.ProvinceCode = &parts[0]
		regencyCode := fmt.Sprintf("%s.%s", parts[0], parts[1])
		districtCode := fmt.Sprintf("%s.%s.%s", parts[0], parts[1], parts[2])
		regionData.RegencyCode = &regencyCode
		regionData.DistrictCode = &districtCode
		regionData.VillageCode = &code
		regionData.VillageName = &name
	}

	return regionData
}

func processBatch(ctx context.Context, client *db.PrismaClient, regions []RegionData) error {
	for _, region := range regions {
		// Create individual records (safer than bulk insert)
		_, err := client.Region.CreateOne(
			db.Region.Code.Set(region.Code),
			db.Region.Name.Set(region.Name),
			db.Region.Level.Set(region.Level),
			db.Region.ProvinceCode.SetIfPresent(region.ProvinceCode),
			db.Region.ProvinceName.SetIfPresent(region.ProvinceName),
			db.Region.RegencyCode.SetIfPresent(region.RegencyCode),
			db.Region.RegencyName.SetIfPresent(region.RegencyName),
			db.Region.DistrictCode.SetIfPresent(region.DistrictCode),
			db.Region.DistrictName.SetIfPresent(region.DistrictName),
			db.Region.VillageCode.SetIfPresent(region.VillageCode),
			db.Region.VillageName.SetIfPresent(region.VillageName),
			db.Region.HasWeatherData.Set(region.Level == 4), // Only villages have weather data
			db.Region.IsActive.Set(true),
		).Exec(ctx)

		if err != nil {
			// Skip duplicates, log other errors
			if !strings.Contains(err.Error(), "unique constraint") {
				log.Printf("Error creating region %s: %v", region.Code, err)
			}
		}
	}
	return nil
}
