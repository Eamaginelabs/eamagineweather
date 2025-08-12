const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Supabase configuration
const supabaseUrl = 'https://puxulujstuvqstihbnbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHVsdWpzdHV2cXN0aWhibmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjM2NTYsImV4cCI6MjA3MDQ5OTY1Nn0.i04raxllNogdZrCz6KnGAPKXj4_BhOOcdNVlFfLf3-k';
const supabase = createClient(supabaseUrl, supabaseKey);

function parseRegionCode(code, name) {
    const parts = code.split('.');
    const level = parts.length;
    
    const now = new Date().toISOString();
    
    const region = {
        id: uuidv4(),
        code: code,
        name: name,
        level: level,
        provinceCode: level >= 1 ? parts[0] : null,
        provinceName: level === 1 ? name : null,
        regencyCode: level >= 2 ? `${parts[0]}.${parts[1]}` : null,
        regencyName: level === 2 ? name : null,
        districtCode: level >= 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : null,
        districtName: level === 3 ? name : null,
        villageCode: level === 4 ? code : null,
        villageName: level === 4 ? name : null,
        latitude: null,
        longitude: null,
        timezone: null,
        hasWeatherData: level === 4, // Only villages have weather data
        isActive: true,
        createdAt: now,
        updatedAt: now
    };
    
    return region;
}

async function processBatch(regions) {
    try {
        const { data, error } = await supabase
            .from('regions')
            .insert(regions)
            .select();
        
        if (error) {
            // If it's duplicate key error, that's expected for some records
            if (!error.message.includes('duplicate key')) {
                console.error('Batch insert error:', error.message);
            }
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Batch processing error:', err.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Indonesian regions migration...');
    
    const fileStream = fs.createReadStream('indonesian_regions.csv');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    let batch = [];
    let batchSize = 100; // Smaller batches for better reliability
    let totalProcessed = 0;
    let line = 0;
    
    for await (const lineData of rl) {
        line++;
        const parts = lineData.split(',');
        
        if (parts.length !== 2) continue;
        
        const code = parts[0].trim();
        const name = parts[1].trim();
        
        if (!code || !name) continue;
        
        const region = parseRegionCode(code, name);
        batch.push(region);
        
        // Process batch when full
        if (batch.length >= batchSize) {
            const success = await processBatch(batch);
            if (success) {
                totalProcessed += batch.length;
                console.log(`✅ Processed ${batch.length} records (total: ${totalProcessed})`);
            } else {
                console.log(`⚠️  Batch had issues (total: ${totalProcessed})`);
            }
            batch = [];
        }
    }
    
    // Process remaining records
    if (batch.length > 0) {
        const success = await processBatch(batch);
        if (success) {
            totalProcessed += batch.length;
        }
        console.log(`✅ Processed final batch of ${batch.length} records`);
    }
    
    console.log(`🎉 Migration completed! Total records processed: ${totalProcessed}`);
    
    // Get summary statistics
    try {
        const { data: stats } = await supabase
            .from('regions')
            .select('level')
            .order('level');
        
        if (stats) {
            const counts = stats.reduce((acc, row) => {
                acc[row.level] = (acc[row.level] || 0) + 1;
                return acc;
            }, {});
            
            console.log('\n📊 Data Summary:');
            const levelNames = {
                1: 'Provinces',
                2: 'Regencies/Cities', 
                3: 'Districts',
                4: 'Villages'
            };
            
            Object.entries(counts).forEach(([level, count]) => {
                const levelName = levelNames[level] || `Level ${level}`;
                console.log(`   ${levelName}: ${count.toLocaleString()}`);
            });
        }
    } catch (err) {
        console.error('Error getting stats:', err.message);
    }
}

main().catch(console.error);