import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment variables check:', {
  VITE_SUPABASE_URL: !!supabaseUrl,
  VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey,
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    actualUrl: supabaseUrl,
    actualKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined'
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Test connection function with detailed logging
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('📡 Supabase URL:', supabaseUrl);
    console.log('🔑 API Key length:', supabaseAnonKey?.length);
    
    // Test with a simple query first
    const { data, error, count } = await supabase
      .from('ico_projects')
      .select('id, name', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Query result:', { data, count });
    return true;
  } catch (error) {
    console.error('💥 Supabase connection failed with exception:', error);
    return false;
  }
};

// Test all tables
export const testAllTables = async () => {
  const tables = ['ico_projects', 'platform_stats', 'featured_projects', 'hero_ads', 'user_profiles'];
  
  for (const table of tables) {
    try {
      console.log(`🔍 Testing table: ${table}`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error(`❌ Error accessing ${table}:`, error);
      } else {
        console.log(`✅ ${table} accessible. Count: ${count}, Sample:`, data);
      }
    } catch (err) {
      console.error(`💥 Exception testing ${table}:`, err);
    }
  }
};

// Initialize connection test
console.log('🚀 Initializing Supabase connection test...');
testConnection().then(connected => {
  if (connected) {
    console.log('🎉 Database connection established successfully!');
    testAllTables();
  } else {
    console.log('🚨 Database connection failed!');
  }
});