# Enterprise Agentic SDLC Framework

**Version:** 2.0.0-Enterprise | **Author:** Kirk Meldrum | **Last Updated:** 2026-02-23

## What This Is

The Enterprise Agentic Software Development Life Cycle (SDLC) is a standardized, DevSecOps-compliant methodology for building multi-stack software applications with AI assistance. Upgraded from v1.0, this framework scales from solo developers to 30+ person enterprise teams by enforcing strict Data Governance, automated CI/CD pipelines, and multi-role orchestration.

## Quick Start

1. **New project?** → Follow `templates/NEW_PROJECT_BOOTSTRAP.md`
2. **Setting up your AI?** → Follow `CLAUDE_PROJECT_SETUP.md`
3. **Starting a dev session?** → Say *"Let's continue [project name]"* to trigger the Session Manager.
4. **Need the visual dashboard?** → Open `artifacts/Enterprise_SDLC_v2.html` in your browser.

## Directory Structure (v2.0)

```text
Dev-Framework/
├── README.md                              ← You are here
├── AI_ASSISTED_DEV_FRAMEWORK_v2.md        ← Master methodology document (The Process)
├── TEAM_ROLES_AND_SCALING.md              ← Multi-person scaling guide (The People)
├── ENTERPRISE_STACKS_v2.md                ← 10 approved architectures (The Technology)
├── CI_CD_PIPELINE_DOCUMENTATION.md        ← DevSecOps & Automated GitHub Actions
├── WIREFRAME_PROCESS.md                   ← Figma wireframe-to-requirements workflow
├── CUSTOM_SKILLS.md                       ← Skill specifications overview
├── CLAUDE_PROJECT_INSTRUCTIONS.md         ← Custom instructions (paste into Claude Project)
├── CLAUDE_PROJECT_SETUP.md                ← Step-by-step Claude Project setup guide
│
├── .github/                               ← DevSecOps & Repository Governance
│   ├── workflows/                         ← CI/CD pipeline automation YAMLs
│   └── ISSUE_TEMPLATE/                    ← Bug and Feature request governance
│
├── templates/
│   ├── PROJECT_STATUS_TEMPLATE.md         ← Template for sprint tracking (Canonical state)
│   ├── REQUIREMENTS_TEMPLATE.md           ← Template for functional requirements
│   └── NEW_PROJECT_BOOTSTRAP.md           ← Step-by-step new project checklist
│
├── skills/                                ← Claude Custom Skills (Upload as AI Knowledge)
│   ├── session-manager/                   ← Session startup protocol
│   ├── requirements-writer/               ← Requirements generation (REQ-XXX format)
│   ├── wireframe-describer/               ← Wireframe descriptions for Figma
│   ├── api-endpoint-generator/            ← Full-stack API endpoint generation
│   ├── react-component-generator/         ← React component generation (all 4 UI states)
│   ├── db-migration-generator/            ← SQL Server migration scripts + DDL updates
│   ├── test-suite-generator/              ← (v2.0) Automated unit/E2E test generation
│   ├── ci-cd-pipeline-generator/          ← (v2.0) GitHub Actions/GitLab CI yaml generator
│   ├── swift-mobile-generator/            ← (v2.0) Native iOS MVVM view generation
│   └── laravel-app-generator/             ← (v2.0) Enterprise PHP/Laravel generation
│
└── artifacts/
    ├── Enterprise_SDLC_v2.html            ← Interactive v2.0 master dashboard
    └── pipeline-flow.mermaid              ← Pipeline flow diagram