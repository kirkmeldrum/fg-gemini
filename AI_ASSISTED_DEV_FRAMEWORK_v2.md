# AI-Assisted Development Framework v2.0

**Version:** 2.0.0-Enterprise  
**Author:** Kirk Meldrum  
**Classification:** Enterprise Standard  

---

## 1. Executive Summary
This framework defines the People, Processes, and Technology required to build enterprise-grade software using Agentic AI. Unlike v1.0, which focused on individual velocity, v2.0 enforces **security**, **scalability**, and **multi-role orchestration**.

### The 3 Pillars
1.  **People:** Explicit roles for Architects, AI Operators, QA Automation, and DevSecOps.
2.  **Process:** A 7-Phase Pipeline with automated CI/CD and Security Gates.
3.  **Technology:** Deterministic AI Tools (Claude/Gemini/ChatGPT) and Approved Enterprise Stacks.

---

## 2. The 7-Phase Enterprise Pipeline

### Phase 0: DISCOVER (Governance & Compliance)
* **Owner:** Project Lead + Enterprise Architect
* **New Activity:** Data Privacy Impact Assessment (DPIA) & Regulatory Check (GDPR/EU AI Act).
* **Output:** `GOVERNANCE_CHECKLIST.md` (Approved by Legal/Compliance).

### Phase 1: DEFINE (Security Requirements)
* **Owner:** Project Lead + Security Engineer
* **New Activity:** Define "Abuse Cases" (how could a bad actor misuse this?).
* **Output:** `REQUIREMENTS.md` (now includes Security Constraints).

### Phase 2: DESIGN (Visual Spec)
* **Owner:** UX Designer + AI Operator
* **Core Activity:** The 5-Color Wireframe Annotation (Data, Actions, Validation, States, Responsive).
* **Output:** Annotated Wireframes + Figma Prototypes.

### Phase 3: ARCHITECT (Threat Modeling)
* **Owner:** Enterprise Architect
* **New Activity:** Threat Modeling (STRIDE) & Architecture Decision Records (ADRs).
* **Output:** `ARCHITECTURE.md`, `THREAT_MODEL.md`, `CI_CD_CONFIG.yaml`.

### Phase 4: BUILD (Agentic Construction)
* **Owner:** AI Operator
* **Tools:** Windsurf, Cursor, VS Code, Google Antigravity.
* **Models:** Claude (Complex Logic), Gemini (Multimodal/UI), ChatGPT (Scripting).
* **New Activity:** AI generates *Unit Tests* alongside feature code.

### Phase 5: VALIDATE (Automated Assurance)
* **Owner:** QA Automation Engineer
* **New Activity:** Automated Regression Testing (Playwright/Jest) & SAST Scanning.
* **Gate 5 Requirement:** All CI checks green + 0 Critical Vulnerabilities.

### Phase 6: DEPLOY (Infrastructure as Code)
* **Owner:** DevSecOps Engineer
* **New Activity:** IaC Provisioning (Terraform/Bicep) & DAST Scanning.
* **Output:** Immutable Production Release.

---

## 3. Tooling Standards

| Category | Approved Tools | Purpose |
| :--- | :--- | :--- |
| **LLMs** | Anthropic Claude 3.5/3.7 | Architecture, Complex Refactoring, Documentation |
| | Google Gemini 1.5 Pro | Multimodal Context, Large Codebase Analysis |
| | OpenAI o1/ChatGPT-4o | Scripting, Quick Logic, Data Formatting |
| **IDEs** | VS Code, Windsurf, Cursor | Primary Development Environments |
| | Google Antigravity | Cloud-Native Agentic Environment |
| **CI/CD** | GitHub Actions / GitLab CI | Automation Pipelines |
| **Security**| SonarQube, OWASP ZAP | Static & Dynamic Analysis |

---

## 4. Operational Principles
1.  **Zero Trust AI:** Never trust AI-generated code without a corresponding test case.
2.  **Shift Left:** Security and Testing start in Phase 1, not Phase 5.
3.  **Docs as Code:** All documentation lives in the repo and evolves with the software.