/**
 * Agent Conversion Script
 * Converts MD agent definitions to YAML format for the orchestrator
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Agent } from '../utils/types';

// Paths
const AGENTS_MD_DIR = path.join(process.cwd(), '..', 'agents');
const AGENTS_YAML_DIR = path.join(process.cwd(), 'backend', 'agents');


/**
 * Convert MD content to Agent object
 */
function parseAgentMd(id: string, content: string): Agent {
    const name = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Default values
    const agent: Agent = {
        id,
        name,
        description: `Expert in ${name.toLowerCase()}`,
        model: 'llama-3.3-70b-versatile',
        system_prompt: content,
        skills: [],
        tools: [],
        temperature: 0.3,
        context_window: 200000
    };

    // Extract basic info if present in a specific format
    // (This is simplistic - in production we'd use more robust parsing)
    if (content.includes('Role:')) {
        const roleMatch = content.match(/Role:\s*(.*)/i);
        if (roleMatch) agent.description = roleMatch[1].trim();
    }

    // Dynamic skill assignment based on ID
    const skillMap: Record<string, string[]> = {
        'financial_modeler': ['financial_modeling'],
        'market_analyst': ['market_sizing_calculator', 'competitor_analysis'],
        'legal_advisor': ['compliance_checker'],
        'output_generator': ['branded_document_generator']
    };

    if (skillMap[id]) {
        agent.skills = skillMap[id];
    }

    return agent;
}

/**
 * Main conversion function
 */
async function convert() {
    console.log('Starting agent conversion...');

    if (!fs.existsSync(AGENTS_MD_DIR)) {
        console.error(`Source directory not found: ${AGENTS_MD_DIR}`);
        return;
    }

    if (!fs.existsSync(AGENTS_YAML_DIR)) {
        fs.mkdirSync(AGENTS_YAML_DIR, { recursive: true });
    }

    const files = fs.readdirSync(AGENTS_MD_DIR).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown files`);

    files.forEach(file => {
        const id = file.replace('.md', '');
        const content = fs.readFileSync(path.join(AGENTS_MD_DIR, file), 'utf-8');

        const agent = parseAgentMd(id, content);
        const yamlContent = yaml.dump(agent);

        fs.writeFileSync(path.join(AGENTS_YAML_DIR, `${id}.yaml`), yamlContent);
        console.log(`Converted: ${id}.yaml`);
    });

    console.log('Conversion complete!');
}

// Support direct execution
if (require.main === module) {
    convert();
}

export { convert };
