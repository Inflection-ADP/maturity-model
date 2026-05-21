<div align="center">

<img src="https://inflection.saisravancherukuri.com/inflection-mark.svg" height="72" alt="Inflection" />

<h1>Inflection</h1>

<p><strong>ADP begins where IDP ends.</strong></p>

<p>A free, open assessment that tells platform engineering teams how ready their platform is for AI agents to work on it — and exactly what to fix first.</p>

[![Live Tool](https://img.shields.io/badge/Take%20the%20Assessment-7C30ED?style=flat-square&logoColor=white)](https://inflection.saisravancherukuri.com/assess)
[![Research Paper](https://img.shields.io/badge/Research%20Paper-Zenodo-blue?style=flat-square)](https://doi.org/10.5281/zenodo.20076846)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Research: CC BY 4.0](https://img.shields.io/badge/Research-CC%20BY%204.0-lightgrey?style=flat-square)](https://creativecommons.org/licenses/by/4.0/)

<br/>

<img src="https://inflection.saisravancherukuri.com/opengraph.jpg" width="720" alt="Inflection — ADP Maturity Assessment" />

</div>

---

## Why this exists

Every serious platform team has spent years building what the industry calls an Internal Developer Platform. Golden paths, self-service portals, automated pipelines. It has been a genuine engineering achievement.

Now AI agents are showing up as a new kind of user. They call APIs at machine speed, read documentation literally, and have no patience for manual steps or ambiguous interfaces. Most platforms were never designed for this, and most teams have no way to measure how far they have to go.

Inflection answers that question. It is a structured, research-backed assessment that scores your platform across seven dimensions, compares your results against every other organization that has taken it, and produces a prioritized roadmap that tells you what to fix first and in what order.

It takes under seven minutes. No account required. Completely open source.

---

## What it measures

Seven dimensions determine whether a platform can support autonomous agent operation. Each one is scored on a four-level scale from fully manual to fully autonomous.

| # | Dimension | What it is asking |
|---|---|---|
| 01 | Documentation | Can an agent read your service catalog and runbooks, or are they written for humans only? |
| 02 | API and Tooling | Can every platform operation be triggered through a structured API, or do some still require a UI? |
| 03 | CI/CD | Can pipelines be started and monitored programmatically, without a person in the loop? |
| 04 | Observability | Is your telemetry structured so a program can interpret it, or is it designed to be read on a dashboard? |
| 05 | Safety | Are your guardrails encoded as enforceable rules, or written as policies that agents cannot read? |
| 06 | Security | Does your platform use short-lived, cryptographically attested identities for workloads, or does it still rely on long-lived credentials? |
| 07 | FinOps | Can you attribute cost to a specific agent and enforce a budget limit automatically? |

Your combined score determines your maturity level and places you within one of four archetypes. The assessment also computes your percentile rank against the full benchmark of completed assessments.

---

## Standards and sources

Each dimension draws from established public standards. The framework is not proprietary — it is a structured synthesis of work the industry has already produced.

| # | Dimension | Standards this draws from |
|---|---|---|
| 01 | Documentation | CNCF Platform Engineering Maturity Model, OpenAPI 3.x Initiative, Backstage / CNCF ecosystem |
| 02 | API and Tooling | OpenGitOps Working Group (CNCF), Kubernetes declarative model, HashiCorp Terraform |
| 03 | CI/CD | DORA Metrics (Google), SLSA supply chain framework, CNCF CD Foundation |
| 04 | Observability | OpenTelemetry (CNCF), Google SRE Book, Prometheus (CNCF) |
| 05 | Safety | NIST SP 800-53, CIS Controls v8, Open Policy Agent (CNCF), SOC 2 Type II |
| 06 | Security and Zero Trust | NIST SP 800-207 Zero Trust Architecture, SPIFFE/SPIRE (CNCF), NIST FIPS 203/204/205 |
| 07 | FinOps | FinOps Foundation Framework, CNCF FinOps Working Group, FOCUS Specification |

All scoring criteria, question rationale, and standard mappings are documented in the research paper published at [DOI 10.5281/zenodo.20076846](https://doi.org/10.5281/zenodo.20076846).

---

## The four archetypes

**Foundation Setter** — Your platform serves your engineers well. It is not yet ready for agents to operate on it reliably. The work starts with the fundamentals: machine-readable documentation and programmable APIs.

**Structured Executor** — Core APIs exist and your pipelines can be triggered programmatically. Agents can handle narrow, well-defined tasks. The gap is consistency — there are still too many paths that require manual intervention.

**Conditional Architect** — Most of your platform is agent-accessible. Safety guardrails are in place. You are one or two dimensions away from full autonomous operation. The remaining gaps are specific and fixable.

**Autonomous Pioneer** — Your platform was built to be operated by programs, not just people. Humans define policy; agents carry it out. You are ahead of most of the industry.

---

## The roadmap

The assessment does not just give you a score. It uses a floor-first algorithm — targeting your weakest dimension first — to produce a week-by-week improvement plan tailored to your results. Each step is concrete and sequenced so you are never working on the wrong thing at the wrong time.

---

## Grounded in research

The framework behind this tool is a peer-reviewed paper published on Zenodo under CC BY 4.0. It explains the scoring model, the rationale behind each dimension, the floor-first roadmap algorithm, and the benchmark methodology.

[Read the paper: DOI 10.5281/zenodo.20076846](https://doi.org/10.5281/zenodo.20076846)

You are free to cite it, adapt it, and build on it with attribution.

---

## Run it yourself

### What you need

- Node.js 20 or later
- pnpm 9 or later
- PostgreSQL 15 or later

### Get the code

```bash
git clone https://github.com/Inflection-ADP/maturity-model.git
cd maturity-model
pnpm install
```

### Configure the environment

Create a `.env` file in `artifacts/api-server/`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/inflection
SESSION_SECRET=a-long-random-string
PORT=3001
BASE_PATH=/api
```

Create a `.env` file in `artifacts/meridian/`:

```
PORT=5173
BASE_PATH=/
```

### Set up the database

```bash
pnpm --filter @workspace/db run push
```

### Start the app

Open two terminals and run one command in each:

```bash
# Terminal 1
pnpm --filter @workspace/api-server run dev

# Terminal 2
pnpm --filter @workspace/meridian run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## How the code is organized

```
maturity-model/
├── artifacts/
│   ├── meridian/          # React + Vite frontend
│   └── api-server/        # Express API
├── lib/
│   ├── db/                # Database schema and migrations
│   ├── api-spec/          # OpenAPI specification
│   └── api-client-react/  # Generated React Query hooks
└── scripts/               # Utility scripts
```

---

## Useful commands

```bash
pnpm run typecheck                              # Type-check all packages
pnpm run build                                 # Build all packages
pnpm --filter @workspace/api-spec run codegen  # Regenerate API hooks from the spec
pnpm --filter @workspace/db run push           # Push schema changes to the database
```

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

The most useful contributions right now are:

- New assessment questions or refinements to existing ones
- Translations of the assessment into other languages
- Improvements to the roadmap generation logic
- Bug reports with clear reproduction steps
- Documentation clarifications

---

## Citing this work

If you use this framework or tool in a publication:

```bibtex
@software{cherukuri2026inflection,
  author    = {Cherukuri, Sai Sravan},
  title     = {Inflection: ADP Maturity Assessment},
  year      = {2026},
  url       = {https://github.com/Inflection-ADP/maturity-model}
}
```

For the research paper:

```bibtex
@article{cherukuri2026adp,
  author    = {Cherukuri, Sai Sravan},
  title     = {ADP Maturity Model: A Framework for Measuring Agent-Ready Platform Engineering},
  year      = {2026},
  doi       = {10.5281/zenodo.20076846},
  publisher = {Zenodo},
  license   = {CC BY 4.0}
}
```

---

## License

The code in this repository is MIT licensed. See [LICENSE](LICENSE).

The research paper (DOI 10.5281/zenodo.20076846) is separately licensed CC BY 4.0.

---

## Author

Sai Sravan Cherukuri
[saisravan@gmail.com](mailto:saisravan@gmail.com)
[inflection.saisravancherukuri.com](https://inflection.saisravancherukuri.com)
