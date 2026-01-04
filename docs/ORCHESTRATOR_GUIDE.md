# AI Business Planner Orchestrator Guide

This guide explains the architecture and usage of the intelligent agent orchestrator that powers the AI Business Planner.

## 🏗️ Architecture

The system uses a multi-agent orchestration pattern to handle complex business planning tasks.

### 1. Orchestrator Core (`/backend/orchestrator`)
The main engine that coordinates the entire process:
- **Intent Analysis**: Uses Groq to determine user goals and required agents.
- **Execution Planning**: Creates a DAG (Directed Acyclic Graph) of tasks.
- **Agent Execution**: Manages parallel or sequential execution of specialized agents.
- **Synthesis**: Combines multiple agent insights into a cohesive markdown response.

### 2. Agent Manager (`/backend/agents`)
Handles stylized AI personas defined in YAML:
- **Persona-based**: Each agent (e.g., Abhishek CA, Maya Patel) has a unique background and style.
- **Capability-mapped**: Agents are registered with specific skills they can invoke.

### 3. Skill Registry (`/backend/skills`)
A toolkit of programmatic functions that agents can call via LLM tool-calling:
- `financial_modeling`: Logic for projections, break-even, and unit economics.
- `market_sizing_calculator`: TAM/SAM/SOM calculations with industry multipliers.
- `competitor_analysis`: SWOT and competitive landscape analysis.
- `compliance_checker`: Industry-specific legal and regulatory checks.
- `branded_document_generator`: PDF/Docx generation with custom branding.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Groq API Key

### Setting up Environment Variables
Create or update `.env.local`:
```env
GROQ_API_KEY=your_groq_key_here
```

### Running the Orchestrator
The orchestrator is exposed via API endpoints:
- `POST /api/orchestrator`: Standard JSON response.
- `GET /api/orchestrator/stream`: Real-time Server-Sent Events (SSE).

---

## 🛠️ Developer Tools

### Converting Agent MD to YAML
If you modify the markdown files in `/agents`, sync them using:
```bash
npx tsx backend/scripts/convert_agents.ts
```

### Running Tests
Verify the full orchestration flow:
```bash
npx tsx backend/scripts/test_orchestrator.ts
```

---

## 🤖 Available Agents

| Agent ID | Name | Role |
|----------|------|------|
| `business_planner_lead` | Sarah Chen | Project Lead & Coordinator |
| `market_analyst` | David Miller | Market Research & Sizing |
| `financial_modeler` | Elena Rodriguez | Financial Strategy |
| `legal_advisor` | James Wilson | Compliance & Structure |
| ...and 9 others | | |

---

## 📦 API Examples

### Standard POST Request
```bash
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to start a gourmet bakery in London"}'
```

### Streaming Updates (SSE)
```javascript
const eventSource = new EventSource('/api/orchestrator/stream?message=Hello');
eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(update.status, update.message);
};
```
