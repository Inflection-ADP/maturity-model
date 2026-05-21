/**
 * scoring.ts
 *
 * Core scoring engine for the Inflection ADP Maturity Assessment.
 *
 * Entry point: scoreAssessment()
 *
 * Algorithm:
 *   1. For each of 7 dimensions, average the 3 question answers (1–5 scale)
 *   2. Map that average to a maturity level: <2 = L1, <3 = L2, <4 = L3, ≥4 = L4
 *   3. Average the 7 dimension levels → continuous overall score
 *   4. Round the overall score → overall level
 *   5. Build a floor-first roadmap: target lowest-scoring dimensions first
 *
 * Author: Sai Sravan Cherukuri <saisravan@gmail.com>
 * License: MIT
 * Research paper: https://doi.org/10.5281/zenodo.20076846
 */

export interface DimensionScore {
  dimension: string;
  label: string;
  score: number;
  level: number;
  levelLabel: string;
  blockers: string[];
  nextSteps: string[];
}

export interface RoadmapItem {
  step: number;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedWeeks: number;
  dimension: string;
  tools: string[];
}

export interface AssessmentResult {
  assessmentId: string;
  orgName: string;
  overallLevel: number;
  overallScore: number;
  levelLabel: string;
  levelDescription: string;
  dimensionScores: DimensionScore[];
  roadmap: RoadmapItem[];
  completedAt: string;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Human-in-the-Loop",
  2: "Triggered Agency",
  3: "Conditional Autonomy",
  4: "Fully Autonomous",
};

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: "Your platform supports AI copilots that suggest actions, but humans copy, paste, and execute every change. The foundation needs to be strengthened before agents can operate reliably.",
  2: "Agents can perform specific tasks when explicitly invoked, with humans reviewing and approving results. You have the building blocks — the next step is proactive monitoring.",
  3: "Agents monitor your systems and propose fixes autonomously. Humans oversee intent rather than execution. You're at the frontier of the IDP-to-ADP transition.",
  4: "Agents manage the full lifecycle within defined safety bounds. Dependency upgrades, drift remediation, and incident response happen autonomously. ADP begins here.",
};

// Tool recommendations per dimension per level
const TOOL_RECOMMENDATIONS: Record<string, Record<number, string[]>> = {
  documentation: {
    1: ["Backstage", "Port", "OpsLevel"],
    2: ["Backstage", "Port", "Confluence", "OpenAPI Generator"],
    3: ["OpsLevel", "Cortex", "Backstage TechDocs"],
  },
  api_tooling: {
    1: ["Terraform", "Pulumi", "Crossplane"],
    2: ["Crossplane", "Humanitec", "Backstage Scaffolder"],
    3: ["Humanitec", "Score", "Helm", "Argo CD"],
  },
  cicd: {
    1: ["GitHub Actions", "GitLab CI", "Jenkins"],
    2: ["Argo CD", "Flux", "Tekton", "CircleCI"],
    3: ["Argo Rollouts", "Keptn", "Dagger"],
  },
  observability: {
    1: ["Datadog", "Grafana", "Prometheus"],
    2: ["OpenTelemetry", "Grafana Loki", "PagerDuty"],
    3: ["Honeycomb", "Jaeger", "OpenTelemetry Collector"],
  },
  safety: {
    1: ["OPA / Gatekeeper", "HashiCorp Sentinel", "Checkov"],
    2: ["Conftest", "Kyverno", "HashiCorp Vault"],
    3: ["Styra DAS", "OPA Rego", "Terraform Sentinel"],
  },
  security_zt: {
    1: ["HashiCorp Vault", "cert-manager", "Keycloak"],
    2: ["SPIFFE/SPIRE", "Istio", "Linkerd"],
    3: ["SPIRE", "Envoy", "FIPS-compliant TLS libs"],
  },
  finops: {
    1: ["Kubecost", "OpenCost", "AWS Cost Explorer"],
    2: ["Apptio Cloudability", "CloudHealth", "FOCUS SDK"],
    3: ["Vantage", "Spot.io", "Harness Cloud Cost"],
  },
};

const DIMENSIONS = [
  {
    key: "documentation",
    label: "Documentation & Context",
    questionIds: ["q1_1", "q1_2", "q1_3"],
    blockersByLevel: {
      1: ["No machine-readable service catalog", "API documentation is missing or stale", "Agents cannot discover service context"],
      2: ["Partial catalog coverage", "Inconsistent metadata formats across services"],
      3: ["Real-time sync not yet in place", "Knowledge graph incomplete"],
    },
    nextStepsByLevel: {
      1: ["Build a software catalog (Backstage or equivalent)", "Add OpenAPI specs to every service", "Define ownership metadata for all services"],
      2: ["Automate catalog sync with CI/CD", "Add dependency mapping to catalog entries"],
      3: ["Implement knowledge graph relationships", "Add real-time sync to catalog"],
    },
  },
  {
    key: "api_tooling",
    label: "API & Tooling Consistency",
    questionIds: ["q2_1", "q2_2", "q2_3"],
    blockersByLevel: {
      1: ["Most operations require manual tickets or portals", "Infrastructure changes are script-based, not API-driven", "No formal tool definitions for agents"],
      2: ["Partial API coverage of platform operations", "Mix of declarative and imperative approaches"],
      3: ["Intent-based API layer not yet implemented", "Tool definitions lack full coverage"],
    },
    nextStepsByLevel: {
      1: ["Expose all platform operations via REST/GraphQL API", "Migrate imperative scripts to Terraform or Crossplane", "Publish MCP or OpenAPI tool definitions"],
      2: ["Implement an intent-based API layer", "Standardize on declarative infra specs"],
      3: ["Build an intent translation layer for complex operations", "Add policy validation to all tool calls"],
    },
  },
  {
    key: "cicd",
    label: "CI/CD & Automation",
    questionIds: ["q3_1", "q3_2", "q3_3"],
    blockersByLevel: {
      1: ["Deployments require manual intervention", "No golden path templates in use", "Ephemeral environments not available"],
      2: ["Automation gaps in pipeline stages", "Template adoption is inconsistent"],
      3: ["Ephemeral environments are slow or manual", "Pipeline lacks agent-triggerable hooks"],
    },
    nextStepsByLevel: {
      1: ["Fully automate deployment pipelines with rollback", "Create and enforce golden path templates", "Build ephemeral environment provisioning"],
      2: ["Add webhooks for agent-triggered pipelines", "Enforce golden path adoption via policy"],
      3: ["Sub-5-minute ephemeral environment provisioning", "Add agent-accessible pipeline APIs"],
    },
  },
  {
    key: "observability",
    label: "Observability & Monitoring",
    questionIds: ["q4_1", "q4_2", "q4_3"],
    blockersByLevel: {
      1: ["No unified observability platform", "Agents cannot consume telemetry data", "Alerts are noisy and lack context"],
      2: ["Fragmented observability across teams", "No structured data feeds for agents"],
      3: ["Real-time streaming not yet available to agents", "Alert context lacks remediation hints"],
    },
    nextStepsByLevel: {
      1: ["Deploy unified observability (Datadog, Grafana, etc.)", "Expose metrics/logs via structured API", "Implement intelligent alerting with context"],
      2: ["Build real-time data feeds agents can consume", "Add SLO tracking to service catalog"],
      3: ["Stream observability events to agent decision engine", "Add anomaly detection to feeds"],
    },
  },
  {
    key: "safety",
    label: "Safety & Governance",
    questionIds: ["q5_1", "q5_2", "q5_3"],
    blockersByLevel: {
      1: ["No policy-as-code enforcement", "No audit trail for automated changes", "No simulation/dry-run capability"],
      2: ["Policy coverage is incomplete", "Audit logs exist but lack context"],
      3: ["Simulation environment not fully representative", "Policy engine doesn't cover all agent actions"],
    },
    nextStepsByLevel: {
      1: ["Implement OPA or Sentinel for policy-as-code", "Build a full audit trail for all changes", "Create a sandbox/dry-run environment"],
      2: ["Expand policy coverage to all agent action types", "Add human-in-loop gates for high-risk operations"],
      3: ["Build high-fidelity production simulation", "Implement auto-rollback with safe-state definitions"],
    },
  },
  {
    key: "security_zt",
    label: "Security & Zero Trust",
    questionIds: ["q6_1", "q6_2", "q6_3"],
    blockersByLevel: {
      1: ["Agents use shared service accounts — no cryptographic identity", "Access control is implicit or absent", "No PQC migration plan"],
      2: ["SPIFFE/SPIRE not deployed", "mTLS not enforced on agent calls"],
      3: ["Policy-as-code coverage incomplete for agent actions", "PQC migration not started"],
    },
    nextStepsByLevel: {
      1: ["Deploy SPIFFE/SPIRE for workload identity", "Enforce mTLS on all agent-to-platform calls", "Begin PQC cryptography inventory"],
      2: ["Implement OPA for per-call policy enforcement", "Rotate to short-lived workload certificates"],
      3: ["Migrate key exchange to FIPS 203 (ML-KEM)", "Implement per-call least-privilege with OPA"],
    },
  },
  {
    key: "finops",
    label: "FinOps & Cost Efficiency",
    questionIds: ["q7_1", "q7_2", "q7_3"],
    blockersByLevel: {
      1: ["No per-agent cost visibility", "One model for all tasks — no routing", "No team-level chargeback"],
      2: ["Cost attribution at service level only", "Model routing is manual or rule-based"],
      3: ["Real-time FOCUS tagging not implemented", "Chargeback exists but isn't automated"],
    },
    nextStepsByLevel: {
      1: ["Deploy Kubecost or OpenCost for per-agent attribution", "Implement complexity-based model routing", "Define squad-level cost accountability"],
      2: ["Adopt FOCUS tagging standard across all agent workloads", "Automate monthly FinOps reviews"],
      3: ["Build real-time per-agent cost dashboards", "Implement automated rightsizing recommendations"],
    },
  },
];

function getQuestionScore(answers: Record<string, number>, questionIds: string[]): number {
  const scores = questionIds.map((id) => answers[id] ?? 3);
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function scoreToLevel(avgScore: number): number {
  if (avgScore < 2) return 1;
  if (avgScore < 3) return 2;
  if (avgScore < 4) return 3;
  return 4;
}

function normalizeScore(avgScore: number): number {
  return Math.min(4, Math.max(1, ((avgScore - 1) / 4) * 3 + 1));
}

export function scoreAssessment(
  assessmentId: string,
  orgName: string,
  answers: Record<string, number>
): AssessmentResult {
  const dimensionScores: DimensionScore[] = DIMENSIONS.map((dim) => {
    const avgScore = getQuestionScore(answers, dim.questionIds);
    const normalizedScore = normalizeScore(avgScore);
    const level = scoreToLevel(avgScore);
    const blockers = level < 4 ? (dim.blockersByLevel[level as 1 | 2 | 3] ?? []) : [];
    const nextSteps = level < 4 ? (dim.nextStepsByLevel[level as 1 | 2 | 3] ?? []) : ["Maintain and extend current best practices", "Document patterns for other teams"];

    return {
      dimension: dim.key,
      label: dim.label,
      score: Math.round(normalizedScore * 100) / 100,
      level,
      levelLabel: LEVEL_LABELS[level],
      blockers,
      nextSteps,
    };
  });

  const avgLevel = dimensionScores.reduce((a, b) => a + b.level, 0) / dimensionScores.length;
  const overallLevel = Math.max(1, Math.min(4, Math.round(avgLevel)));
  const overallScore = Math.round(avgLevel * 100) / 100;

  const roadmap = buildRoadmap(dimensionScores);

  return {
    assessmentId,
    orgName,
    overallLevel,
    overallScore,
    levelLabel: LEVEL_LABELS[overallLevel],
    levelDescription: LEVEL_DESCRIPTIONS[overallLevel],
    dimensionScores,
    roadmap,
    completedAt: new Date().toISOString(),
  };
}

function buildRoadmap(dimensionScores: DimensionScore[]): RoadmapItem[] {
  const items: RoadmapItem[] = [];
  let step = 1;

  const sorted = [...dimensionScores].sort((a, b) => a.level - b.level);

  for (const dim of sorted) {
    if (dim.level === 4) continue;
    const priority: "critical" | "high" | "medium" | "low" =
      dim.level === 1 ? "critical" : dim.level === 2 ? "high" : "medium";

    const toolsForLevel = TOOL_RECOMMENDATIONS[dim.dimension]?.[dim.level as 1 | 2 | 3] ?? [];

    for (const ns of dim.nextSteps.slice(0, 2)) {
      const weeks = dim.level === 1 ? 8 : dim.level === 2 ? 6 : 4;
      items.push({
        step,
        title: ns,
        description: `Addressing a key gap in ${dim.label} to advance from ${dim.levelLabel} toward the next maturity level.`,
        priority,
        estimatedWeeks: weeks,
        dimension: dim.dimension,
        tools: toolsForLevel,
      });
      step++;
      if (items.length >= 8) break;
    }
    if (items.length >= 8) break;
  }

  return items;
}

export function computeAggregateInsights(results: AssessmentResult[]) {
  if (results.length === 0) {
    return {
      totalAssessments: 0,
      averageLevel: 0,
      levelDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
      topBlockers: [],
      industryBreakdown: [],
      weakestDimension: "",
      strongestDimension: "",
    };
  }

  const levelDist: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const blockerCounts: Record<string, number> = {};
  const dimLevelSums: Record<string, number> = {};
  const dimCounts: Record<string, number> = {};

  for (const r of results) {
    levelDist[r.overallLevel] = (levelDist[r.overallLevel] ?? 0) + 1;
    for (const ds of r.dimensionScores) {
      dimLevelSums[ds.dimension] = (dimLevelSums[ds.dimension] ?? 0) + ds.level;
      dimCounts[ds.dimension] = (dimCounts[ds.dimension] ?? 0) + 1;
      for (const b of ds.blockers) {
        blockerCounts[b] = (blockerCounts[b] ?? 0) + 1;
      }
    }
  }

  const topBlockers = Object.entries(blockerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([blocker, count]) => ({ blocker, count }));

  const dimAvgs = Object.entries(dimLevelSums).map(([dim, sum]) => ({
    dim,
    avg: sum / (dimCounts[dim] ?? 1),
  }));
  dimAvgs.sort((a, b) => a.avg - b.avg);

  const weakestDimension = dimAvgs[0]?.dim ?? "";
  const strongestDimension = dimAvgs[dimAvgs.length - 1]?.dim ?? "";
  const averageLevel =
    results.reduce((a, b) => a + b.overallLevel, 0) / results.length;

  return {
    totalAssessments: results.length,
    averageLevel: Math.round(averageLevel * 100) / 100,
    levelDistribution: levelDist,
    topBlockers,
    industryBreakdown: [],
    weakestDimension,
    strongestDimension,
  };
}
