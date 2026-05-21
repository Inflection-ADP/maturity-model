# How the Score Is Calculated

This document explains the full scoring methodology behind the Inflection ADP Maturity Assessment — why these seven dimensions, why equal weighting, what the formula is, and what a score actually means.

The scoring engine lives in [`artifacts/api-server/src/lib/scoring.ts`](../artifacts/api-server/src/lib/scoring.ts). You can read the exact implementation there. This document explains the reasoning behind it.

---

## Why this tool exists

Platform engineering teams spend years building internal developer platforms — golden paths, self-service portals, automated pipelines. But these platforms were designed for human developers.

AI agents are a different kind of user. They call APIs at machine speed, read documentation literally, have no patience for ambiguous interfaces, and cannot navigate a portal that requires clicking through a UI. Most platforms were never designed for this, and there was no agreed-upon way to measure how ready — or unready — a platform was.

This tool fills that gap. It gives platform teams a structured, honest answer to a specific question: is your platform ready for agents to operate on it, and if not, what do you fix first?

The framework is derived from a peer-reviewed paper published at [DOI 10.5281/zenodo.20076846](https://doi.org/10.5281/zenodo.20076846) and draws from established public standards including NIST, CNCF working groups, DORA, SLSA, and the FinOps Foundation.

---

## Why these seven dimensions

Each dimension is a specific, non-negotiable prerequisite for autonomous agent operation — not a performance metric, not a best practice. A prerequisite. Miss one and your agent program hits a hard wall.

### 01 — Documentation and Context

Agents read your platform before they act on it. If your service catalog lives in a wiki, or your runbooks are written for a human who can infer context, an agent cannot use them. Machine-readable documentation is not a nice-to-have — it is the floor below which no automation is possible.

**What the questions ask about:** Whether your service catalog exists and is kept current automatically, whether an agent can query it programmatically, and whether your API documentation covers every service consistently.

**Standards this draws from:** CNCF Platform Engineering Maturity Model, OpenAPI 3.x Initiative, Backstage / CNCF ecosystem

---

### 02 — API and Tooling Coverage

An agent can only do what an API allows it to do. If 40% of your platform operations still require someone to log into a portal and click through a form, that 40% is permanently off-limits to autonomous operation. Every manual step in your platform is a hard ceiling on what agents can accomplish.

**What the questions ask about:** What fraction of platform operations are available through a formal API, whether infrastructure changes use declarative specifications rather than imperative scripts, and whether an automated system can trigger infrastructure changes with a full audit trail.

**Standards this draws from:** OpenGitOps Working Group (CNCF), Kubernetes declarative model, HashiCorp Terraform

---

### 03 — CI/CD and Automation

The delivery pipeline is the most frequently touched surface in any platform. Agents that can write, review, and merge code are useless if deploying that code still requires a human to press a button. Deployments need to be fully automated, rollbacks need to be instant, and the pipeline itself needs to be triggerable by a program.

**What the questions ask about:** How automated your deployment pipeline is end-to-end, whether golden path templates are consistently used across teams, and whether you can spin up isolated environments on demand without human involvement.

**Standards this draws from:** DORA Metrics (Google), SLSA supply chain framework, CNCF CD Foundation

---

### 04 — Observability and Monitoring

A dashboard is human observability. An API is agent observability. Agents need to read system state programmatically, in structured formats, in real time. If your telemetry is locked inside a SaaS product that provides only a UI and an email alert, agents are flying blind.

**What the questions ask about:** Whether you have unified observability across all services rather than per-team silos, whether an agent can consume your telemetry data through a structured feed or API, and whether your alerting produces clean, actionable signals rather than noise.

**Standards this draws from:** OpenTelemetry (CNCF), Google SRE Book, Prometheus (CNCF)

---

### 05 — Safety and Governance

This is what makes autonomy sustainable rather than reckless. Without policy-as-code, agents operate with undefined permissions. Without an audit trail, every automated change is unaccountable. Without dry-run capability, there is no way to validate what a change will do before it affects production.

**What the questions ask about:** Whether infrastructure changes are governed by enforceable policies written as code rather than as documents, whether every automated change creates a verifiable audit trail, and whether you can simulate a change before applying it.

**Standards this draws from:** NIST SP 800-53, CIS Controls v8, Open Policy Agent (CNCF), SOC 2 Type II

---

### 06 — Security and Zero Trust

An agent that authenticates to your platform using a shared service account credential is indistinguishable from a compromised service account. Zero trust means every caller is verified, every call is authorized, and nothing is trusted by default — including agents you built yourself.

**What the questions ask about:** Whether agents and automated workloads have unique, cryptographically verifiable identities rather than shared credentials, how access is controlled for agent API calls, and where your organization stands on post-quantum cryptography migration.

**Standards this draws from:** NIST SP 800-207 Zero Trust Architecture, SPIFFE/SPIRE (CNCF), NIST FIPS 203/204/205

---

### 07 — FinOps and Cost Efficiency

Agentic workloads introduce a cost surface that most FinOps practices were not designed for: per-call LLM inference costs, background agents running continuously, and compute that scales with autonomous decisions rather than user traffic. If you cannot attribute cost to a specific agent or use case, you cannot set budgets, cannot optimize, and cannot make a defensible business case.

**What the questions ask about:** Whether you can attribute LLM and agent compute costs to specific teams in real time, whether agent tasks are routed to the most cost-appropriate model, and whether cost accountability is enforced at the team level.

**Standards this draws from:** FinOps Foundation Framework, CNCF FinOps Working Group, FOCUS Specification

---

## Why all seven dimensions are weighted equally

The most common question about the scoring model is whether some dimensions should count for more than others.

The answer is no, and the reason is structural.

These dimensions are not tradeoffs — they are prerequisites.

Think of a water pipe. You can widen every section except one, and the narrowest section still determines how much water flows. A platform that scores exceptionally on six of seven dimensions but has no policy guardrails is not 86% autonomous — it is dangerous to deploy agents on. Equal weighting enforces this: you cannot optimize away a problem by being exceptional elsewhere. You have to fix the gaps.

The floor-first roadmap takes this further. It always targets your lowest-scoring dimension first, because the weakest dimension is your binding constraint. If your observability is at L1, improving your already-strong CI/CD to L4 does not meaningfully advance your autonomy.

---

## Why four levels, not a continuous score

The four maturity levels are not arbitrary buckets. Each one describes a qualitatively different relationship between your platform and autonomous agents.

| Level | Label | What it means |
|---|---|---|
| L1 | Human-in-the-Loop | The platform works for humans. Every meaningful action requires a human to initiate it. |
| L2 | Triggered Agency | Agents can execute specific, bounded tasks when a human explicitly invokes them. Nothing more. |
| L3 | Conditional Autonomy | Agents can observe conditions, decide within defined guardrails, and act without being told to. |
| L4 | Fully Autonomous | Agents manage routine operations end-to-end. Humans set goals and constraints. Agents execute. |

You cannot reach L3 by being excellent at L2 things — the operational modes are genuinely distinct.

The continuous overall score (e.g. 2.43) exists alongside the level so that organizations within the same level can see where they sit relative to each other. Two L2 organizations at 1.8 and 2.7 are in very different places even though their level label is the same.

---

## The formula

Every score this tool produces can be traced back to your answers using simple arithmetic. There are no hidden adjustments, no weights applied after the fact, no normalization that changes the meaning of your responses.

### Step 1 — Average the three answers per dimension

```
dimension average = (answer 1 + answer 2 + answer 3) / 3
```

Each question is answered on a 1–5 scale. 1 means the capability does not exist. 5 means it is fully in place and working well. The three answers are averaged. This average is continuous — 2.67 is meaningfully different from 2.33.

### Step 2 — Map that average to a level

```
average < 2  →  L1
average < 3  →  L2
average < 4  →  L3
average ≥ 4  →  L4
```

These thresholds correspond to qualitatively different states. Below 2 means the capability barely exists. Below 3 means it exists but is unreliable or inconsistent. Below 4 means it is mostly working but not fully production-grade. At 4 and above means it is solid. Each dimension gets its own independent level.

### Step 3 — Average the seven dimension levels

```
overall score = (dim 1 level + dim 2 level + ... + dim 7 level) / 7
```

The seven dimension levels are averaged into a continuous overall score. The overall maturity level shown in results is this number rounded to the nearest integer. The continuous score is used for the radar chart and the percentile calculation.

### Worked example

A team answers the Documentation questions as 2, 3, and 2:

```
(2 + 3 + 2) / 3 = 2.33  →  L2
```

Their seven dimension levels are: L2, L2, L3, L1, L2, L1, L2

```
(2 + 2 + 3 + 1 + 2 + 1 + 2) / 7 = 1.86
overall score: 1.86  →  overall level: L2 (rounds to 2)
```

The two L1 dimensions — Observability and Security — are where the roadmap starts. The CI/CD strength at L3 does not offset them.

---

## How the percentile works

Every completed assessment goes into the benchmark pool. The percentile is:

```
percentile = (assessments with score below yours) / (total completed assessments) × 100
```

This uses the continuous score, not the rounded level. Two organizations at the same maturity level will have different percentiles if their underlying scores differ.

The number of assessments in the pool is shown on your result. When the pool is below 30 responses, the result page says so explicitly — a percentile from 8 responses is not the same thing as one from 800, and you deserve to know which you are looking at.

Organization names are never shown publicly. Only anonymized aggregate trends appear in industry benchmarks. Pool data is used solely to compute comparative rankings.

---

## What this tool does not do

The score reflects how you answered, not an independent audit of your platform. This is self-reported data. The tool is designed to help you think clearly about your platform's readiness, not to certify it.

A team that answers optimistically will get an optimistic score and a roadmap that starts from the wrong place. The questions are specific enough that most people can locate themselves accurately without trying.

The 1–5 scale is calibrated so that 3 means "partially in place." It is not a passing grade. If you answer 3 on every question, your score will land around L2 — accurate for a platform that has the basics but is not reliably programmable.

The roadmap is derived directly from your scores. It is a starting point for planning, not a finished project plan.

---

## Source code

The scoring implementation is in [`artifacts/api-server/src/lib/scoring.ts`](../artifacts/api-server/src/lib/scoring.ts).

The function `scoreAssessment()` is the entry point. It takes your answers, computes dimension scores, maps them to levels, averages to an overall score, and builds the roadmap via `buildRoadmap()` using the floor-first algorithm.

---

## Author

Sai Sravan Cherukuri  
[saisravan@gmail.com](mailto:saisravan@gmail.com)  
[inflection.saisravancherukuri.com](https://inflection.saisravancherukuri.com)

Research paper: [DOI 10.5281/zenodo.20076846](https://doi.org/10.5281/zenodo.20076846)
