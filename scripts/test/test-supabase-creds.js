
const { createClient } = require('@supabase/supabase-js');

const url = 'https://sqleasycmnykqsywnbtk.supabase.co';
const key = 'sb_secret_lemmp8koviwr0-O99ho2Yw_T1yQWlje';

console.log('Testing Supabase Data Persistence...');

async function checkData() {
    try {
        const supabase = createClient(url, key);

        // Check for the most recent session
        const { data, error } = await supabase
            .from('questionnaire_sessions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('❌ Query Failed:', error.message);
        } else {
            console.log('✅ Connection Successful!');
            if (data && data.length > 0) {
                console.log('Latest Session ID:', data[0].id);
                console.log('Created At:', data[0].created_at);
                console.log('Answers:', JSON.stringify(data[0].answers, null, 2));
            } else {
                console.log('⚠️ No sessions found. It seems the app is running but has not saved data yet.');
            }
        }
    } catch (e) {
        console.error('❌ Unexpected Error:', e.message);
    }
}

checkData();
