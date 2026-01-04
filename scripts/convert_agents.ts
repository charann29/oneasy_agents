#!/usr/bin/env tsx
/**
 * Agent Conversion Script
 * Converts agent markdown files to YAML format for the orchestrator system
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface AgentYAML {
  id: string;
  name: string;
  description: string;
  model: string;
  system_prompt: string;
  skills: string[];
  tools: string[];
  temperature: number;
  context_window: number;
  phase?: string;
  persona?: string;
}

const AGENTS_SOURCE_DIR = path.join(__dirname, '../../agents');
const AGENTS_TARGET_DIR = path.join(__dirname, '../backend/agents');

// Ensure target directory exists
if (!fs.existsSync(AGENTS_TARGET_DIR)) {
  fs.mkdirSync(AGENTS_TARGET_DIR, { recursive: true });
}

function extractAgentId(filename: string): string {
  return filename.replace('.md', '');
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractSkills(content: string): string[] {
  const skills: string[] = [];
  
  // Look for skills section or responsibilities that mention skills
  const skillsSection = extractSection(content, 'Skills');
  const responsibilitiesSection = extractSection(content, 'Responsibilities');
  
  const combinedText = skillsSection + ' ' + responsibilitiesSection;
  
  // Common skill patterns
  const skillPatterns = [
    'financial_modeling',
    'market_sizing_calculator',
    'competitor_analysis',
    'compliance_checker',
    'branded_document_generator'
  ];
  
  skillPatterns.forEach(skill => {
    if (combinedText.toLowerCase().includes(skill.replace(/_/g, ' ')) || 
        combinedText.toLowerCase().includes(skill)) {
      skills.push(skill);
    }
  });
  
  return skills;
}

function extractTools(content: string): string[] {
  const tools: string[] = [];
  
  // Look for common tools mentioned
  if (content.toLowerCase().includes('web search') || 
      content.toLowerCase().includes('search the web')) {
    tools.push('web_search');
  }
  
  if (content.toLowerCase().includes('calculator') || 
      content.toLowerCase().includes('calculation')) {
    tools.push('calculator');
  }
  
  return tools;
}

function buildSystemPrompt(content: string, agentId: string): string {
  const role = extractSection(content, 'Role');
  const persona = extractSection(content, 'Persona');
  const responsibilities = extractSection(content, 'Responsibilities');
  const knowledgeDomains = extractSection(content, 'Knowledge Domains');
  const conversationFlow = extractSection(content, 'Conversation Flow');
  
  let prompt = `# ${agentId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Agent\n\n`;
  
  if (role) {
    prompt += `## Role\n${role}\n\n`;
  }
  
  if (persona) {
    prompt += `## Persona\n${persona}\n\n`;
  }
  
  if (responsibilities) {
    prompt += `## Responsibilities\n${responsibilities}\n\n`;
  }
  
  if (knowledgeDomains) {
    prompt += `## Knowledge Domains\n${knowledgeDomains}\n\n`;
  }
  
  if (conversationFlow) {
    prompt += `## Conversation Flow\n${conversationFlow}\n\n`;
  }
  
  prompt += `\nYou are an expert business planning agent. Provide detailed, actionable insights based on your specialized knowledge.`;
  
  return prompt.trim();
}

function convertAgentToYAML(mdFilePath: string): AgentYAML | null {
  try {
    const content = fs.readFileSync(mdFilePath, 'utf-8');
    const filename = path.basename(mdFilePath);
    const agentId = extractAgentId(filename);
    
    // Extract metadata
    const nameMatch = content.match(/# (.+?) Agent/i);
    const name = nameMatch ? nameMatch[1] : agentId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const role = extractSection(content, 'Role');
    const description = role || `Specialized agent for ${name.toLowerCase()}`;
    
    const phase = extractSection(content, 'Phase');
    const persona = extractSection(content, 'Persona');
    
    const skills = extractSkills(content);
    const tools = extractTools(content);
    
    const systemPrompt = buildSystemPrompt(content, agentId);
    
    const agentYAML: AgentYAML = {
      id: agentId,
      name,
      description: description.split('\n')[0], // First line only
      model: 'llama-3.3-70b-versatile',
      system_prompt: systemPrompt,
      skills,
      tools,
      temperature: 0.3,
      context_window: 200000
    };
    
    if (phase) {
      agentYAML.phase = phase;
    }
    
    if (persona) {
      agentYAML.persona = persona.substring(0, 200); // Truncate for brevity
    }
    
    return agentYAML;
  } catch (error) {
    console.error(`Error converting ${mdFilePath}:`, error);
    return null;
  }
}

function main() {
  console.log('🔄 Converting agent markdown files to YAML...\n');
  
  // Read all markdown files from agents directory
  const files = fs.readdirSync(AGENTS_SOURCE_DIR).filter(f => f.endsWith('.md'));
  
  console.log(`Found ${files.length} agent files to convert\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  files.forEach(file => {
    const mdPath = path.join(AGENTS_SOURCE_DIR, file);
    const agentYAML = convertAgentToYAML(mdPath);
    
    if (agentYAML) {
      const yamlPath = path.join(AGENTS_TARGET_DIR, `${agentYAML.id}.yaml`);
      const yamlContent = yaml.dump(agentYAML, { lineWidth: -1, noRefs: true });
      
      fs.writeFileSync(yamlPath, yamlContent, 'utf-8');
      console.log(`✅ ${agentYAML.id}.yaml - ${agentYAML.name}`);
      successCount++;
    } else {
      console.log(`❌ Failed to convert ${file}`);
      failCount++;
    }
  });
  
  console.log(`\n📊 Conversion complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`\n📁 YAML files saved to: ${AGENTS_TARGET_DIR}`);
}

main();
