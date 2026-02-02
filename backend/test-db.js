require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
    console.log("🔄 Testing Supabase Connection...");

    // 1. Try to fetch from the 'profiles' table
    // (Even if empty, it should return an empty array, not an error)
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.error("❌ Connection Failed:", error.message);
        console.error("-> Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    } else {
        console.log("✅ Connection Successful! Read data:", data);
    }
}

testConnection();