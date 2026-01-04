const { createClient } = require('@supabase/supabase-js');

const url = 'https://sqleasycmnykqsywnbtk.supabase.co';
const serviceKey = 'sb_secret_lemmp8koviwr0-O99ho2Yw_T1yQWlje';

console.log('=== CHECKING TABLE COLUMNS ===\n');

async function checkColumns() {
    const supabase = createClient(url, serviceKey);

    // Get one row to see what columns exist (or use empty select)
    const { data, error } = await supabase
        .from('questionnaire_sessions')
        .select('*')
        .limit(1);

    if (error) {
        // If table is empty, try to get column info from a dummy insert
        console.log('Table might be empty, checking via RPC...');

        // Alternative: query information_schema
        const { data: cols, error: colError } = await supabase.rpc('get_table_columns', {
            table_name: 'questionnaire_sessions'
        });

        if (colError) {
            console.log('Could not get columns via RPC:', colError.message);
        } else {
            console.log('Columns:', cols);
        }
    } else {
        if (data && data.length > 0) {
            console.log('Existing columns:');
            Object.keys(data[0]).forEach(col => {
                console.log(' -', col, ':', typeof data[0][col]);
            });
        } else {
            console.log('Table is empty. Attempting minimal insert to identify columns...');

            // Try a minimal insert with just required fields based on OLD schema
            const { error: insertError } = await supabase
                .from('questionnaire_sessions')
                .insert({
                    user_id: '00000000-0000-0000-0000-000000000001',
                })
                .select();

            if (insertError) {
                console.log('Insert error reveals columns:', insertError.message);
                console.log('Hint:', insertError.hint);
            }
        }
    }
}

checkColumns();
