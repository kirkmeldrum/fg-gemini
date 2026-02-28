# Team Roles & Scaling: The "People" Layer

**Version:** 2.0  
**Purpose:** Define responsibilities for multi-person teams operating the Agentic SDLC.

---

## 1. The Core Roles

### 🧠 Project Lead (The "What")
* **Focus:** Value Delivery & Requirements.
* **Phase Ownership:** Phase 0 (Discover), Phase 1 (Define).
* **AI Interaction:** Uses Gemini/Claude for market research and requirements refinement.

### 🏗️ Enterprise Architect (The "Structure")
* **Focus:** System Design, Compliance, Stack Selection.
* **Phase Ownership:** Phase 3 (Architect).
* **Responsibility:** Approves `ARCHITECTURE.md` and selects the Technology Stack (A-H).

### ⚡ AI Operator (The "Builder")
* **Focus:** Feature Implementation.
* **Phase Ownership:** Phase 2 (Design), Phase 4 (Build).
* **Responsibility:** "Pilot" of the IDE (Windsurf/Cursor). Translates requirements into code using AI. *Note: On large teams, this splits into Frontend Operator and Backend Operator.*

### 🛡️ QA Automation Engineer (The "Verifier")
* **Focus:** Test Strategy & Quality Gates.
* **Phase Ownership:** Phase 5 (Validate).
* **Responsibility:** Prompts AI to write Jest/Playwright suites. Owns the "Green Build."

### 🔐 DevSecOps Engineer (The "Gatekeeper")
* **Focus:** Security, Infrastructure, Deployment.
* **Phase Ownership:** Phase 6 (Deploy).
* **Responsibility:** Manages CI/CD pipelines, Secrets Management, and Cloud Infrastructure.

---

## 2. Scaling Models

### Model A: The "Solo Agent" (1 Person)
* **You wear all hats.**
* **Focus:** Speed.
* **Risk:** Burnout & Security blind spots.
* **Mitigation:** Heavily rely on `DevSecOps-Agent` skills to automate security checks.

### Model B: The "Squad" (3-5 People)
* 1 Project Lead (Product + Design)
* 2-3 AI Operators (Full Stack)
* 1 QA/DevOps Hybrid
* **Workflow:** Feature Branch workflow. Code Reviews required before merge.

### Model C: The "Enterprise Factory" (20+ People)
* **Dedicated Architecture Team:** Sets standards (Stacks A-H).
* **Feature Teams:** 1 PM, 1 Designer, 3 AI Operators, 1 QA per team.
* **Platform Team:** Manages the CI/CD pipelines and reusable AI Skills.