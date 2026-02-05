# AI Product Operator Portfolio Project Plan

## Strategic Framing

Based on Ramp's tech stack and the role requirements, this project:

- **Uses Ramp's actual stack**: Anthropic/OpenAI for LLM, Snowflake/ClickHouse for data, Amplitude for analytics
- **Solves a real pain point**: Exception handling is manual, high-volume, and policy-dependent—perfect for AI automation
- **Demonstrates the exact skills they want**: Process mapping → workflow building → measurement → enablement

---

## Project Overview

### The Problem

Finance/Accounting teams at companies using expense management tools spend **15-25 hours/week** on:

- Reviewing expense exceptions flagged by policy rules
- Chasing down employees for missing receipts or out-of-policy justifications
- Categorizing ambiguous expenses
- Generating audit-ready documentation

### The Solution

An AI-powered workflow that:

1. **Auto-triages** expense exceptions by severity/type
2. **Drafts contextual follow-up messages** to employees
3. **Suggests categorization** for ambiguous expenses based on merchant data + description
4. **Generates audit documentation** with policy citations

---

## Detailed Project Plan

### Phase 1: Process Mapping & Requirements (Week 1)

| Task | Deliverable | Tools |
|------|-------------|-------|
| Interview 3-5 finance professionals about exception handling workflows | Process map document | Notion, Loom for async interviews |
| Document current state: inputs, decisions, outputs, time spent | Current state flow diagram | Mermaid/Lucidchart |
| Identify automation opportunities with effort/impact matrix | Prioritization matrix | Notion database |
| Define success metrics | Metrics framework | — |

#### Key Metrics to Track

| Metric | Target |
|--------|--------|
| Time saved per exception | 60%+ reduction |
| Accuracy of AI categorization suggestions | 85%+ |
| User adoption rate | >90% active usage |
| Employee response rate to AI-drafted follow-ups | Baseline + improvement |

---

### Phase 2: Technical Architecture & Build (Weeks 2-4)

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Expense DB  │  │ Policy Rules │  │ Historical Decisions │   │
│  │  (Snowflake) │  │   (Notion)   │  │     (ClickHouse)     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                    n8n / Gumloop                             ││
│  │  • Webhook triggers on new exceptions                        ││
│  │  • Data enrichment pipeline                                  ││
│  │  • LLM routing logic                                         ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AI LAYER                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │   Anthropic    │  │     OpenAI     │  │   Groq (fast)    │   │
│  │  (Complex      │  │  (Embeddings/  │  │  (Simple triage) │   │
│  │   reasoning)   │  │   Search)      │  │                  │   │
│  └────────────────┘  └────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OUTPUT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Slack/Email  │  │   Dashboard  │  │  Audit Log (DB)      │   │
│  │  (Twilio)    │  │  (Amplitude) │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Build Tasks

| Week | Component | Description | Stack |
|------|-----------|-------------|-------|
| 2 | Data pipeline setup | Connect to sample expense data, policy docs | Python, SQL, Snowflake connector |
| 2 | Exception classification model | Fine-tune prompt for triage (auto-approve, needs-review, escalate) | Claude API, few-shot prompting |
| 3 | Workflow orchestration | Build n8n flows for exception routing | n8n, webhooks |
| 3 | Message generation | Draft contextual follow-ups based on exception type | Claude API, templating |
| 4 | Dashboard | Real-time metrics on exceptions processed, time saved | Amplitude or simple Streamlit |
| 4 | Audit log generator | Auto-generate compliance documentation | Claude + structured output |

#### Technical Specifications

**AI Model Routing Strategy** (mirrors Ramp's multi-provider approach):

```python
def route_to_model(exception_type, complexity_score):
    if complexity_score < 0.3:
        # Simple triage - use fast/cheap model
        return "groq/llama-3"  # or together.ai
    elif exception_type in ["policy_violation", "fraud_flag"]:
        # Complex reasoning needed
        return "anthropic/claude-sonnet"
    else:
        # Standard categorization
        return "openai/gpt-4o-mini"
```

**Sample Prompt Structure:**

```xml
<context>
Company expense policy: {policy_summary}
Historical approval patterns: {similar_past_decisions}
</context>

<exception>
Amount: $347.82
Merchant: Blue Bottle Coffee
Category flagged: Meals & Entertainment
Policy rule triggered: Single meal > $100
Employee note: "Team lunch for 4 people - product launch celebration"
</exception>

<task>
1. Assess policy compliance (compliant/needs-clarification/violation)
2. If needs-clarification: draft a friendly follow-up message
3. Suggest proper categorization with confidence score
4. Note any audit considerations
</task>
```

---

### Phase 3: Testing & Iteration (Week 5)

| Task | Method | Success Criteria |
|------|--------|------------------|
| Accuracy testing | Run against 100 historical exceptions with known outcomes | >85% match to human decisions |
| Edge case identification | Deliberately test ambiguous scenarios | Document handling approach |
| Latency testing | Measure end-to-end processing time | <5 sec for triage, <15 sec for full workflow |
| User feedback | Share with 2-3 finance professionals | Qualitative validation |

---

### Phase 4: Documentation & Enablement (Week 6)

#### Deliverables for Portfolio

**1. Process Documentation**
- Before/after workflow diagrams
- Decision logic documentation
- API integration specs

**2. Demo Video (3-5 min)**
- Walkthrough of end-to-end workflow
- Show real exceptions being processed
- Highlight measurement dashboard

**3. Metrics Report**
- Time savings calculation
- Accuracy benchmarks
- User adoption simulation

**4. Enablement Materials** *(demonstrates ability to coach AI champions)*
- Quick-start guide for finance teams
- "When to override AI" decision framework
- Training slide deck

---

## Resource Requirements

| Resource | Purpose | Cost Estimate |
|----------|---------|---------------|
| Anthropic API | Primary LLM | ~$20-50 for project |
| OpenAI API | Embeddings, backup | ~$10-20 |
| n8n Cloud | Workflow orchestration | Free tier sufficient |
| Snowflake | Data warehouse | Free trial |
| Sample data | Test scenarios | Generate synthetic data |

---

## Mapping to Job Description

| JD Requirement | How Project Demonstrates |
|----------------|--------------------------|
| "Deploy AI-driven automations" | Full working automation pipeline |
| "Map processes, build workflows" | Documented current/future state + n8n implementation |
| "Tools like n8n, Cursor, ChatGPT" | Used n8n for orchestration, Cursor for development |
| "Measure impact via dashboards" | Amplitude/Streamlit metrics dashboard |
| "Operational empathy" | Interviews with real finance professionals |
| "Coach AI champions" | Enablement materials and training deck |
| "Technical fluency with SQL, APIs" | Direct API integrations, SQL for data pipeline |

---

## Immediate Next Steps

| Timeline | Action |
|----------|--------|
| **Today** | Set up n8n account, Anthropic API key, create project repo |
| **This week** | Schedule 2-3 informational interviews with finance professionals |
| **Week 1** | Complete process mapping, generate synthetic expense data |
| **Week 4** | Working demo complete |
| **Week 6** | Polished portfolio piece ready |
