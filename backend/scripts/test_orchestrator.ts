/**
 * Orchestrator Test Script
 * Tests the full orchestration flow with a sample request
 */

import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') });


import { Orchestrator } from '../orchestrator';
import { logger } from '../utils/logger';

async function test() {
    console.log('Starting Orchestrator Test...');

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        console.error('GROQ_API_KEY not found in environment');
        return;
    }

    const orchestrator = new Orchestrator({
        groqApiKey,
        model: 'llama-3.3-70b-versatile'
    });

    const testMessage = "Help me create a business plan for a new EV charging station network in Hyderabad. I need to understand the market size and financial projections.";

    try {
        console.log(`Test Message: "${testMessage}"`);
        console.log('Processing request... (this may take a minute)');

        const response = await orchestrator.processRequest(testMessage);

        console.log('\n--- TEST RESULTS ---');
        console.log(`Goal: ${response.intent.goal}`);
        console.log(`Agents Used: ${response.agent_outputs.map(o => o.agent_name).join(', ')}`);
        console.log(`Execution Type: ${response.plan.execution_type}`);
        console.log(`Execution Time: ${(response.execution_time_ms / 1000).toFixed(2)}s`);

        console.log('\n--- SYNTHESIS ---');
        console.log(response.synthesis);

        console.log('\n--- AGENT DETAILS ---');
        response.agent_outputs.forEach((output, i) => {
            console.log(`\n${i + 1}. Agent: ${output.agent_name} (${output.agent_id})`);
            console.log(`Skills: ${output.skills_used.join(', ') || 'none'}`);
            console.log(`Success: ${output.success}`);
            if (!output.success) console.log(`Error: ${output.error}`);
            console.log(`Output Snippet: ${output.output.substring(0, 200)}...`);
        });

        console.log('\nTest complete!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
