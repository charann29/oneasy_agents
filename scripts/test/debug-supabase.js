const { createClient } = require('@supabase/supabase-js');

// Using service key to bypass RLS for testing
const url = 'https://sqleasycmnykqsywnbtk.supabase.co';
const serviceKey = 'sb_secret_lemmp8koviwr0-O99ho2Yw_T1yQWlje';

console.log('=== SUPABASE DEBUG TEST ===\n');

async function debugSupabase() {
    try {
        const supabase = createClient(url, serviceKey);

        // 1. Check table structure
        console.log('1. Checking if questionnaire_sessions table exists...');
        const { data: tableInfo, error: tableError } = await supabase
            .from('questionnaire_sessions')
            .select('*')
            .limit(0);

        if (tableError) {
            console.log('❌ Table Error:', tableError.message);
            console.log('   Code:', tableError.code);
            console.log('   Details:', tableError.details);
            console.log('\n   → This suggests the table may not exist or have different name');
            return;
        }
        console.log('✅ Table exists!\n');

        // 2. Try to insert a test row using ACTUAL schema
        console.log('2. Attempting test insert...');
        const testId = 'test-' + Date.now();
        const { data: insertData, error: insertError } = await supabase
            .from('questionnaire_sessions')
            .insert({
                id: testId,
                user_id: '00000000-0000-0000-0000-000000000001', // dummy UUID
                current_phase: 0,
                current_question_index: 0,
                status: 'in_progress',  // Using actual DB schema
                completed_phases: [],
                answers: { test: true },
            })
            .select()
            .single();

        if (insertError) {
            console.log('❌ Insert Error:', insertError.message);
            console.log('   Code:', insertError.code);
            console.log('   Details:', insertError.details);
            console.log('   Hint:', insertError.hint);

            // Check for schema mismatch
            if (insertError.message.includes('column')) {
                console.log('\n   → Schema mismatch! The table columns don\'t match the code.');
            }
            // Check for RLS
            if (insertError.code === '42501' || insertError.message.includes('policy')) {
                console.log('\n   → RLS policy is blocking inserts. Need to check policies.');
            }
        } else {
            console.log('✅ Insert successful!');
            console.log('   Inserted ID:', insertData?.id);

            // Clean up test data
            await supabase.from('questionnaire_sessions').delete().eq('id', testId);
            console.log('   (Test row cleaned up)\n');
        }

        // 3. Query all sessions
        console.log('3. Counting all sessions in table...');
        const { count, error: countError } = await supabase
            .from('questionnaire_sessions')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.log('❌ Count Error:', countError.message);
        } else {
            console.log('   Total sessions in DB:', count);
        }

        // 4. Check for any data at all
        console.log('\n4. Fetching latest 5 sessions...');
        const { data: sessions, error: sessionError } = await supabase
            .from('questionnaire_sessions')
            .select('id, user_id, created_at, current_phase, answers')
            .order('created_at', { ascending: false })
            .limit(5);

        if (sessionError) {
            console.log('❌ Query Error:', sessionError.message);
        } else if (sessions && sessions.length > 0) {
            console.log('   Found sessions:');
            sessions.forEach((s, i) => {
                console.log(`   ${i + 1}. ID: ${s.id?.substring(0, 8)}... | Phase: ${s.current_phase} | Answers: ${JSON.stringify(s.answers).substring(0, 50)}...`);
            });
        } else {
            console.log('   ⚠️ No sessions found in the database.');
        }

        console.log('\n=== DEBUG COMPLETE ===');

    } catch (e) {
        console.error('❌ Unexpected Error:', e.message);
    }
}

debugSupabase();
