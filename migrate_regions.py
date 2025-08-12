#!/usr/bin/env python3

import csv
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime
import uuid

# Database connection
DATABASE_URL = "postgresql://postgres.puxulujstuvqstihbnbx:Priandhika404@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

def parse_region_code(code, name):
    """Parse region code into hierarchical data"""
    parts = code.split('.')
    level = len(parts)
    
    region_data = {
        'id': str(uuid.uuid4()),
        'code': code,
        'name': name,
        'level': level,
        'province_code': None,
        'province_name': None,
        'regency_code': None,
        'regency_name': None,
        'district_code': None,
        'district_name': None,
        'village_code': None,
        'village_name': None,
        'has_weather_data': level == 4,  # Only villages have weather data
        'is_active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    if level == 1:  # Province
        region_data['province_code'] = code
        region_data['province_name'] = name
    elif level == 2:  # Regency
        region_data['province_code'] = parts[0]
        region_data['regency_code'] = code
        region_data['regency_name'] = name
    elif level == 3:  # District
        region_data['province_code'] = parts[0]
        region_data['regency_code'] = f"{parts[0]}.{parts[1]}"
        region_data['district_code'] = code
        region_data['district_name'] = name
    elif level == 4:  # Village
        region_data['province_code'] = parts[0]
        region_data['regency_code'] = f"{parts[0]}.{parts[1]}"
        region_data['district_code'] = f"{parts[0]}.{parts[1]}.{parts[2]}"
        region_data['village_code'] = code
        region_data['village_name'] = name
    
    return region_data

def process_batch(cursor, regions):
    """Process a batch of regions"""
    insert_query = """
        INSERT INTO regions (
            id, code, name, level, 
            province_code, province_name, regency_code, regency_name,
            district_code, district_name, village_code, village_name,
            has_weather_data, is_active, created_at, updated_at
        ) VALUES %s
        ON CONFLICT (code) DO NOTHING
    """
    
    values = []
    for region in regions:
        values.append((
            region['id'], region['code'], region['name'], region['level'],
            region['province_code'], region['province_name'], 
            region['regency_code'], region['regency_name'],
            region['district_code'], region['district_name'],
            region['village_code'], region['village_name'],
            region['has_weather_data'], region['is_active'],
            region['created_at'], region['updated_at']
        ))
    
    psycopg2.extras.execute_values(cursor, insert_query, values, template=None, page_size=100)

def main():
    print("🚀 Starting Indonesian regions migration...")
    
    # Connect to database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print("✅ Connected to Supabase database")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return
    
    try:
        # Read and process CSV
        with open('indonesian_regions.csv', 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            
            batch = []
            batch_size = 1000
            total_processed = 0
            
            for row in reader:
                if len(row) != 2:
                    continue
                    
                code = row[0].strip()
                name = row[1].strip()
                
                if not code or not name:
                    continue
                
                region_data = parse_region_code(code, name)
                batch.append(region_data)
                
                # Process batch when full
                if len(batch) >= batch_size:
                    process_batch(cursor, batch)
                    conn.commit()
                    total_processed += len(batch)
                    print(f"✓ Processed {len(batch)} records (total: {total_processed})")
                    batch = []
            
            # Process remaining records
            if batch:
                process_batch(cursor, batch)
                conn.commit()
                total_processed += len(batch)
                print(f"✓ Processed final batch of {len(batch)} records")
        
        print(f"🎉 Migration completed! Total records processed: {total_processed}")
        
        # Print summary
        cursor.execute("SELECT level, COUNT(*) FROM regions GROUP BY level ORDER BY level")
        results = cursor.fetchall()
        print("\n📊 Data Summary:")
        level_names = {1: "Provinces", 2: "Regencies/Cities", 3: "Districts", 4: "Villages"}
        for row in results:
            level_name = level_names.get(row['level'], f"Level {row['level']}")
            print(f"   {level_name}: {row['count']:,}")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()