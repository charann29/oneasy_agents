const { createClient } = require('@supabase/supabase-js');

const url = 'https://sqleasycmnykqsywnbtk.supabase.co';
const serviceKey = 'sb_secret_lemmp8koviwr0-O99ho2Yw_T1yQWlje';

async function checkData() {
    const supabase = createClient(url, serviceKey);

    console.log('=== CHECKING STORED DATA ===\n');

    // Count all sessions
    const { count, error: countErr } = await supabase
        .from('questionnaire_sessions')
        .select('*', { count: 'exact', head: true });

    if (countErr) {
        console.log('Error counting:', countErr.message);
        return;
    }

    console.log('Total sessions in DB:', count);

    // Get latest session with full data
    const { data, error } = await supabase
        .from('questionnaire_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.log('Error fetching:', error.message);
        return;
    }

    if (data && data.length > 0) {
        const session = data[0];
        console.log('\n✅ LATEST SESSION:');
        console.log('  ID:', session.id);
        console.log('  User ID:', session.user_id);
        console.log('  Created:', session.created_at);
        console.log('  Messages count:', session.messages ? session.messages.length : 0);
        console.log('  Language:', session.language);
        console.log('  Status:', session.status);
        console.log('  Completed:', session.completed);

        if (session.messages && session.messages.length > 0) {
            console.log('\n  Latest message:', session.messages[session.messages.length - 1].content?.substring(0, 100));
        }

        if (session.accumulated_context) {
            console.log('  Context keys:', Object.keys(session.accumulated_context));
        }

        console.log('\n✅ STORAGE IS WORKING!');
    } else {
        console.log('\n⚠️ No sessions found');
    }
}

checkData();
