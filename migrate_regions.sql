-- Indonesian Regions Migration Script
-- This script processes the CSV data into hierarchical structure

-- Create temporary table to load CSV data
CREATE TEMP TABLE temp_regions_csv (
    code TEXT,
    name TEXT
);

-- You'll need to load the CSV data into temp_regions_csv first
-- Then run the following to populate the regions table:

WITH parsed_regions AS (
    SELECT 
        gen_random_uuid() as id,
        code,
        name,
        array_length(string_to_array(code, '.'), 1) as level,
        CASE 
            WHEN array_length(string_to_array(code, '.'), 1) >= 1 
            THEN split_part(code, '.', 1)
            ELSE NULL 
        END as province_code,
        CASE 
            WHEN array_length(string_to_array(code, '.'), 1) = 1 
            THEN name
            ELSE NULL 
        END as province_name,
        CASE 
            WHEN array_length(string_to_array(code, '.'), 1) >= 2 
            THEN split_part(code, '.', 1) || '.' || split_part(code, '.', 2)
            ELSE NULL 
        END as regency_code,
        CASE 
            WHEN array_length(string_to_array(code, '.'), 1) = 2 
            THEN name
            ELSE NULL 
        END as regency_name,
        CASE 
            WHEN array_length(string_to_array(code, '.'), 1) >= 3 
            THEN split_part(code, '.', 1) || '.' || split_part(code, '.', 2) || '.' || split_part(code, '.', 3)
            ELSE NULL 
        END as district_code,
        CASE 
            WHEN array_length(string_to_array(code, '.'), 1) = 3 
            THEN name
            ELSE NULL 
        END as district_name,
        CASE 
            WHEN array_length(string_to_array(code, '.'), 1) = 4 
            THEN code
            ELSE NULL 
        END as village_code,
        CASE 
            WHEN array_length(string_to_array(code, '.'), 1) = 4 
            THEN name
            ELSE NULL 
        END as village_name,
        array_length(string_to_array(code, '.'), 1) = 4 as has_weather_data,
        true as is_active,
        NOW() as created_at,
        NOW() as updated_at
    FROM temp_regions_csv
    WHERE code IS NOT NULL AND name IS NOT NULL
)
INSERT INTO regions (
    id, code, name, level,
    province_code, province_name, regency_code, regency_name,
    district_code, district_name, village_code, village_name,
    has_weather_data, is_active, created_at, updated_at
)
SELECT 
    id, code, name, level,
    province_code, province_name, regency_code, regency_name,
    district_code, district_name, village_code, village_name,
    has_weather_data, is_active, created_at, updated_at
FROM parsed_regions
ON CONFLICT (code) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_regions_level ON regions(level);
CREATE INDEX IF NOT EXISTS idx_regions_province_code ON regions(province_code);
CREATE INDEX IF NOT EXISTS idx_regions_regency_code ON regions(regency_code);
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);
CREATE INDEX IF NOT EXISTS idx_regions_has_weather_data ON regions(has_weather_data);

-- Show migration results
SELECT 
    level,
    CASE level
        WHEN 1 THEN 'Provinces'
        WHEN 2 THEN 'Regencies/Cities' 
        WHEN 3 THEN 'Districts'
        WHEN 4 THEN 'Villages'
        ELSE 'Unknown'
    END as level_name,
    COUNT(*) as count
FROM regions 
GROUP BY level 
ORDER BY level;