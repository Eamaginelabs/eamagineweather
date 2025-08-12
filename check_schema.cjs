const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://puxulujstuvqstihbnbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHVsdWpzdHV2cXN0aWhibmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjM2NTYsImV4cCI6MjA3MDQ5OTY1Nn0.i04raxllNogdZrCz6KnGAPKXj4_BhOOcdNVlFfLf3-k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        // Try to insert a simple test record to see what columns exist
        const testRecord = {
            code: 'TEST',
            name: 'Test',
            level: 1
        };
        
        const { data, error } = await supabase
            .from('regions')
            .insert([testRecord])
            .select();
        
        if (error) {
            console.log('Schema error reveals column structure:');
            console.log(error.message);
        } else {
            console.log('Success! Schema accepts these columns:', Object.keys(testRecord));
            // Clean up test record
            await supabase.from('regions').delete().eq('code', 'TEST');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkSchema();