# Ramp Expense Intelligence

Multi-model AI system for expense processing, anomaly detection, and policy compliance. Routes tasks across four AI providers based on complexity, cost, and capability.

## Architecture

```
React Client (Vite, port 5173)
        │
        │  /api/*
        ▼
Express Server (Bun, port 3001)
   ┌────┴────┐
   │ Services │──► Model Router / Anomaly Detector / Policy Engine
   └────┬────┘
        │
   AI Provider Registry
   ┌──────────┬──────────┬────────┬──────────┐
   │ Anthropic│  OpenAI  │  Groq  │ Cerebras │
   │ Claude   │ GPT-4o-  │ Llama  │  Llama   │
   │ 3.5 Haiku│  mini    │ 3.3 70B│  3.3 70B │
   └──────────┴──────────┴────────┴──────────┘
```

## Intelligent Model Routing

The core feature: incoming tasks are scored for complexity, then routed to the best-fit provider with automatic fallback.

| Task Type | Primary | Fallback | Why |
|---|---|---|---|
| Simple Receipt | Groq | Cerebras | Fastest and cheapest |
| Complex Invoice | Anthropic | OpenAI | Best reasoning for multi-line items |
| Policy Compliance | OpenAI | Anthropic | Native function calling for structured checks |
| Anomaly Explanation | Anthropic | Groq | Strong audit-grade reasoning |

**Complexity scoring** analyzes input signals (CSV row count, image size, text length, line item patterns) to classify tasks as simple or complex. If the primary provider fails, the system automatically retries with the fallback.

## Anomaly Detection

Rule-based engine with five detection strategies, each producing severity-scored flags:

| Rule | Severity | What It Catches |
|---|---|---|
| Duplicate | High | Same vendor + amount within 2 days |
| Unusual Amount | High | Over 3x the category average |
| Frequency Spike | Medium | Same vendor >3 times in one week |
| Weekend Expense | Medium | Saturday/Sunday transactions |
| Round Number | Low | Amounts ≥$100 ending in .00 |

Flagged expenses can be sent to an AI provider for a detailed audit-perspective explanation.

## Policy Compliance

Three capabilities built on natural language policy input:

1. **Policy Parsing** -- Write rules in plain English (e.g., "Meals must be under $75"). The system parses them into structured rules.

2. **Expense Evaluation** -- Each expense is checked against active rules. OpenAI's function calling drives three structured checks:
   - `check_amount_limit` -- category budget validation
   - `check_category_allowed` -- permitted category verification
   - `check_receipt_required` -- receipt threshold enforcement

3. **Policy Chat** -- Conversational agent that answers compliance questions ("Can we expense a $200 team dinner?") with full context of active policy and recent expenses.

## Provider Metrics & Observability

Every AI request is tracked:
- **Per-provider**: total requests, avg latency, avg cost, success rate, P95 latency
- **Per-request**: provider used, latency, estimated cost, fallback usage
- **Visualizations**: cost vs. latency comparison charts, latency history over time

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Server | Express |
| Client | React 19, Tailwind CSS, React Router |
| Build | Vite |
| AI Providers | Anthropic SDK, OpenAI SDK, Groq SDK, Cerebras (OpenAI-compatible) |

## Setup

```bash
# Install dependencies
bun install

# Configure API keys (copy and fill in your keys)
cp .env.example .env
```

Required environment variables:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk-...
CEREBRAS_API_KEY=csk-...
APP_PASSWORD=ramp2026
```

All four providers are optional -- the system works with any subset of keys configured.

## Running

```bash
bun run dev            # Start server + client concurrently
bun run dev:server     # Server only (port 3001)
bun run dev:client     # Client only (port 5173)
```

The server seeds 48 sample expenses on startup (mix of normal and suspicious) so you can test immediately.

## API Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth` | Password authentication |
| GET | `/api/health` | Provider availability status |
| POST | `/api/route` | Upload file, classify, route to AI, extract expenses |
| POST | `/api/anomaly/detect` | Run all detection rules against expenses |
| GET | `/api/anomaly/flags` | Retrieve flagged expenses (filterable by severity) |
| POST | `/api/anomaly/explain` | Generate AI explanation for a flag |
| POST | `/api/policy/set` | Parse natural language into structured policy rules |
| POST | `/api/policy/evaluate` | Evaluate a single expense against active policy |
| POST | `/api/policy/chat` | Conversational policy Q&A |
| GET | `/api/expenses` | Paginated expense list |
| POST | `/api/expenses/upload` | Bulk CSV upload |
| DELETE | `/api/expenses/:id` | Remove an expense |
| GET | `/api/metrics` | Aggregated provider performance |
| GET | `/api/metrics/history` | Recent request-level metrics |
