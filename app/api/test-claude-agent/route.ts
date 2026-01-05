/**
 * PROTOTYPE TEST: Claude Agent Executor
 *
 * Tests if Claude can properly:
 * 1. Execute an agent (financial_modeler)
 * 2. Call skills (financial_modeling)
 * 3. Return meaningful results
 *
 * GET /api/test-claude-agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClaudeAgentExecutor } from '@/lib/orchestrator/claude-agent-executor';

export async function GET(request: NextRequest) {
    try {
        console.log('🧪 PROTOTYPE TEST: Starting Claude Agent Test...\n');

        // Sample questionnaire data (minimal for testing)
        const sampleAnswers = {
            business_name: 'CloudCRM Pro',
            business_idea: 'B2B SaaS CRM for small businesses',
            business_model_type: 'SaaS',
            revenue_model: 'subscription',
            target_industries: ['SaaS', 'Software'],
            primary_market: 'India',
            currency: 'INR',
            year1_revenue: 1340000, // ₹13.4L
            growth_rate: '50-100',
            gross_margin: 73,
            customer_type: 'B2B',
            target_price: '7950',
            team_size_year1: 5
        };

        console.log('📋 Sample Data:', JSON.stringify(sampleAnswers, null, 2));

        // Get executor
        const executor = getClaudeAgentExecutor();

        console.log('\n🤖 Executing financial_modeler agent...\n');

        // Execute financial_modeler agent
        const result = await executor.executeAgent('financial_modeler', {
            allAnswers: sampleAnswers
        });

        console.log('\n✅ AGENT EXECUTION COMPLETE\n');
        console.log('📊 Results Summary:');
        console.log(`- Agent: ${result.agentName}`);
        console.log(`- Output Length: ${result.output.length} characters`);
        console.log(`- Skills Called: ${result.toolCallsMade.length}`);
        console.log(`- Execution Time: ${result.executionTimeMs}ms`);
        console.log(`- Tokens Used: ${result.tokensUsed.input} input, ${result.tokensUsed.output} output`);

        if (result.toolCallsMade.length > 0) {
            console.log('\n🔧 Skills Executed:');
            result.toolCallsMade.forEach((toolCall, idx) => {
                console.log(`  ${idx + 1}. ${toolCall.skill}`);
                console.log(`     Params:`, JSON.stringify(toolCall.params, null, 2).substring(0, 200));
                console.log(`     Result:`, JSON.stringify(toolCall.result, null, 2).substring(0, 500));
            });
        }

        console.log('\n📄 Agent Output Preview:');
        console.log(result.output.substring(0, 1000) + '...\n');

        // Return detailed results
        return NextResponse.json({
            success: true,
            message: '✅ PROTOTYPE TEST PASSED',
            test: 'claude-agent-executor',
            agent: {
                id: result.agentId,
                name: result.agentName,
                outputLength: result.output.length,
                executionTimeMs: result.executionTimeMs
            },
            skills: {
                count: result.toolCallsMade.length,
                called: result.toolCallsMade.map(tc => ({
                    skill: tc.skill,
                    paramsSize: JSON.stringify(tc.params).length,
                    resultSize: JSON.stringify(tc.result).length
                }))
            },
            tokens: result.tokensUsed,
            outputPreview: result.output.substring(0, 500) + '...',
            fullOutput: result.output, // Include full output
            verification: {
                agentLoaded: !!result.agentName,
                skillsCalled: result.toolCallsMade.length > 0,
                meaningfulOutput: result.output.length > 100,
                executionFast: result.executionTimeMs < 30000 // < 30 seconds
            }
        });

    } catch (error) {
        console.error('❌ PROTOTYPE TEST FAILED:', error);

        return NextResponse.json({
            success: false,
            message: '❌ PROTOTYPE TEST FAILED',
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            troubleshooting: {
                checkApiKey: 'Ensure ANTHROPIC_API_KEY is set in .env',
                checkAgents: 'Verify agent YAML files are loaded',
                checkSkills: 'Verify skill implementations exist'
            }
        }, { status: 500 });
    }
}
