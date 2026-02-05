AI Product Operator Portfolio Project Plan
Strategic Framing

Uses Ramp's actual stack: Anthropic/OpenAI for LLM, Snowflake/ClickHouse for data, Amplitude for analytics
Solves a real pain point: Exception handling is manual, high-volume, and policy-dependent—perfect for AI automation
Demonstrates the exact skills they want: Process mapping → workflow building → measurement → enablement

Project Overview
The Problem
Finance/Accounting teams at companies using expense management tools spend 15-25 hours/week on:

Reviewing expense exceptions flagged by policy rules
Chasing down employees for missing receipts or out-of-policy justifications
Categorizing ambiguous expenses
Generating audit-ready documentation

The Solution
An AI-powered workflow that:

Auto-triages expense exceptions by severity/type
Drafts contextual follow-up messages to employees
Suggests categorization for ambiguous expenses based on merchant data + description
Generates audit documentation with policy citations


Detailed Project Plan
Phase 1: Process Mapping & Requirements (Week 1)
TaskDeliverableToolsInterview 3-5 finance professionals about exception handling workflowsProcess map documentNotion, Loom for async interviewsDocument current state: inputs, decisions, outputs, time spentCurrent state flow diagramMermaid/LucidchartIdentify automation opportunities with effort/impact matrixPrioritization matrixNotion databaseDefine success metricsMetrics framework-
Key Metrics to Track:

Time saved per exception (target: 60%+ reduction)
Accuracy of AI categorization suggestions (target: 85%+)
User adoption rate (target: >90% active usage)
Employee response rate to AI-drafted follow-ups


Phase 2: Technical Architecture & Build (Weeks 2-4)
Architecture Overview
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
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    n8n / Gumloop                          │   │
│  │  • Webhook triggers on new exceptions                     │   │
│  │  • Data enrichment pipeline                               │   │
│  │  • LLM routing logic                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
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
Build Tasks
WeekComponentDescriptionStack2Data pipeline setupConnect to sample expense data, policy docsPython, SQL, Snowflake connector2Exception classification modelFine-tune prompt for triage (auto-approve, needs-review, escalate)Claude API, few-shot prompting3Workflow orchestrationBuild n8n flows for exception routingn8n, webhooks3Message generationDraft contextual follow-ups based on exception typeClaude API, templating4DashboardReal-time metrics on exceptions processed, time savedAmplitude or simple Streamlit4Audit log generatorAuto-generate compliance documentationClaude + structured output
Technical Specifications
AI Model Routing Strategy (mirrors Ramp's multi-provider approach):
pythondef route_to_model(exception_type, complexity_score):
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
```
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

Phase 3: Testing & Iteration (Week 5)
TaskMethodSuccess CriteriaAccuracy testingRun against 100 historical exceptions with known outcomes>85% match to human decisionsEdge case identificationDeliberately test ambiguous scenariosDocument handling approachLatency testingMeasure end-to-end processing time<5 seconds for triage, <15 for full workflowUser feedbackShare with 2-3 finance professionalsQualitative validation

Phase 4: Documentation & Enablement (Week 6)
Deliverables for your portfolio:

Process Documentation

Before/after workflow diagrams
Decision logic documentation
API integration specs


Demo Video (3-5 min)

Walkthrough of end-to-end workflow
Show real exceptions being processed
Highlight measurement dashboard


Metrics Report

Time savings calculation
Accuracy benchmarks
User adoption simulation


Enablement Materials (shows you can coach AI champions)

Quick-start guide for finance teams
"When to override AI" decision framework
Training slide deck
