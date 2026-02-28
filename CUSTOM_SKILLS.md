### 2. The Updated `CUSTOM_SKILLS.md`

```markdown
# Custom Claude Skills — Overview (v2.0)

**Version:** 2.0.0-Enterprise | **Last Updated:** 2026-02-23

## What Are Custom Skills?

Custom skills are specific `SKILL_[name].md` files uploaded to a Claude/Gemini Project as knowledge. They instruct the AI to produce consistent, pattern-following output for common development and DevSecOps tasks. By triggering a skill, you force the AI to execute deterministic checklists, preventing hallucinations and ensuring enterprise standards are met.

## Current Skills (The Core 10)

| Skill | Location | Trigger Examples |
|-------|----------|-----------------|
| **Session Manager** | `skills/session-manager/SKILL.md` | "Let's continue", "resume project", project name at session start |
| **Requirements Writer** | `skills/requirements-writer/SKILL.md` | "write requirements for", "define requirements", informal descriptions |
| **Wireframe Describer** | `skills/wireframe-describer/SKILL.md` | "wireframe for", "design the page", "what should this look like" |
| **API Endpoint Generator** | `skills/api-endpoint-generator/SKILL.md` | "create endpoint", "add API for", "build backend for" |
| **React Component Gen.** | `skills/react-component-generator/SKILL.md` | "create component", "build page for", "add UI for" |
| **DB Migration Generator** | `skills/db-migration-generator/SKILL.md` | "add table", "add column", "change schema", "database migration" |
| **Test Suite Generator** *(New)* | `skills/test-suite-generator/SKILL.md` | "write tests for", "generate test suite", "automate QA for" |
| **Swift Mobile Generator** *(New)* | `skills/swift-mobile-generator/SKILL.md` | "build iOS view", "create Swift component" |
| **Laravel App Generator** *(New)* | `skills/laravel-app-generator/SKILL.md` | "build PHP backend", "generate Laravel controller/model" |
| **CI/CD Pipeline Generator** *(New)* | `skills/ci-cd-pipeline-generator/SKILL.md`| "create deployment pipeline", "generate GitHub actions for" |

## How to Use Custom Skills

### For a New AI Project Workspace (Claude/Gemini/Windsurf)
1. Create a new Project workspace.
2. Upload the relevant `SKILL_[name].md` files as project knowledge.
3. Upload `PROJECT_STATUS.md` as project knowledge.
4. Upload all `docs/*.md` files as project knowledge.
5. Set the custom instructions: *"Always follow the Session Manager protocol at the start of each conversation."*

### For an Existing Project
1. Open Project Settings → Knowledge.
2. Upload any new `SKILL_[name].md` files (e.g., adding `SKILL_test-suite-generator.md` when entering Phase 5).
3. Skills take effect immediately in new conversations.

## Skill Development Roadmap (v2.1+)

| Planned Skill | Priority | Target Owner | Status |
|---------------|----------|--------------|--------|
| **RAG/Vector DB Indexer** | P1 | AI Operator | Planned |
| **Security Threat Modeler** | P1 | Enterprise Architect | Planned |
| **Smart Contract Generator** | P2 | AI Operator | Planned |
| **Performance Auditor** | P3 | QA Automation Eng. | Planned |