const { createClient } = require('@supabase/supabase-js');

const url = 'https://sqleasycmnykqsywnbtk.supabase.co';
const serviceKey = 'sb_secret_lemmp8koviwr0-O99ho2Yw_T1yQWlje';

console.log('=== FINAL SUPABASE SCHEMA TEST ===\n');

async function testFinalSchema() {
    try {
        const supabase = createClient(url, serviceKey);

        // Use proper UUID format
        const crypto = require('crypto');
        const testId = crypto.randomUUID();
        const testUserId = crypto.randomUUID();

        console.log('1. Testing INSERT with correct schema...');
        console.log('   Session ID:', testId);
        console.log('   User ID:', testUserId);

        const { data: insertData, error: insertError } = await supabase
            .from('questionnaire_sessions')
            .insert({
                id: testId,
                user_id: testUserId,
                current_phase: 0,
                current_question_index: 0,
                status: 'in_progress',
                completed_phases: [],
                answers: { testKey: 'testValue' }
            })
            .select()
            .single();

        if (insertError) {
            console.log('❌ Insert Error:', insertError.message);
            console.log('   Code:', insertError.code);

            // Check for FK constraint
            if (insertError.message.includes('foreign key') || insertError.code === '23503') {
                console.log('\n   ⚠️ FOREIGN KEY ERROR: The user_id must exist in users table!');
                console.log('   → The old schema has: user_id UUID REFERENCES users(id)');
                console.log('   → Auth users are NOT automatically in users table');
                console.log('\n   FIX OPTIONS:');
                console.log('   1. Run schema-complete.sql (removes FK constraint)');
                console.log('   2. Or add a trigger to create users automatically');
            }
        } else {
            console.log('✅ INSERT SUCCESSFUL!');
            console.log('   Created session:', insertData?.id);

            // Clean up
            await supabase.from('questionnaire_sessions').delete().eq('id', testId);
            console.log('   (Test data cleaned up)');
        }

        console.log('\n=== TEST COMPLETE ===');

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testFinalSchema();
