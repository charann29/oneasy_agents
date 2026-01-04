const { createClient } = require('@supabase/supabase-js');

// Using the CORRECT project that the app uses
const url = 'https://xdivsjtvxwgyaxfwhgoe.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY_HERE';

async function verifyTable() {
    console.log('=== VERIFYING TABLE IN CORRECT PROJECT ===');
    console.log('Project:', url);

    // Note: You'll need to provide the service key for xdivsjtvxwgyaxfwhgoe project
    // For now, let's just check if we can query it with anon key

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
    const supabase = createClient(url, anonKey);

    console.log('\n1. Checking if table exists...');
    const { data, error } = await supabase
        .from('questionnaire_sessions')
        .select('*')
        .limit(0);

    if (error) {
        console.log('❌ Error:', error.message);
        console.log('   This might just be RLS blocking - table could still exist');
    } else {
        console.log('✅ Table exists and is queryable!');
    }

    console.log('\n2. Checking column structure via SQL...');
    console.log('   Run this in Supabase SQL Editor to see columns:');
    console.log('   SELECT column_name, data_type FROM information_schema.columns');
    console.log('   WHERE table_name = \'questionnaire_sessions\' ORDER BY ordinal_position;');
}

verifyTable();
