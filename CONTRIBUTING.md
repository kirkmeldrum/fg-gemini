# Contributing to the AI-Assisted Development Framework

Thank you for your interest in contributing to the AI-Assisted Development Framework! This document provides guidelines for contributing to this methodology and associated tools.

## What This Framework Is

The AI-Assisted Development Framework is a standardized methodology for building software applications with AI assistance. It enables non-software developers to create production-grade applications by following structured operating procedures and using specialized AI skills.

## How to Contribute

### Types of Contributions

We welcome contributions in the following areas:

#### 1. **Framework Improvements**
- Enhanced processes or workflows
- New phases or gates
- Improved documentation
- Better checklists or templates

**How to contribute:**
- Create an issue describing the improvement
- Provide examples of the current process and your proposed change
- Include rationale for why this improves the framework

#### 2. **New Custom Skills**
Custom skills are Claude AI tools that automate parts of the development process. We're actively building the skill library.

**How to create a skill:**
1. Review existing skills in `skills/` directory to understand the format
2. Follow the SKILL template: name, description, purpose, process, output format
3. Include pre-generation checklist and quality rules
4. Test the skill by using it in a real project
5. Document any new conventions it introduces
6. Submit as a pull request with the skill file in `skills/[skill-name]/`

**Skill ideas we need:**
- Figma-to-React code generator
- Testing strategy generator (QA test plans)
- Security audit generator
- Performance optimization analyzer
- Migration strategy generator
- Team scaling playbook generator

#### 3. **Project Templates**
Share implementations using this framework. Reference implementations help others learn.

**How to contribute:**
- Create a new directory: `templates/projects/[project-name]/`
- Include: PROJECT_STATUS.md, REQUIREMENTS.md, ARCHITECTURE.md, sample code
- Document lessons learned and decisions made
- Include estimated effort and complexity level

#### 4. **Documentation**
- Clearer explanations of concepts
- Better examples or case studies
- Translations (eventually)
- Video walkthroughs (create issues, don't add videos to repo)

**How to contribute:**
- Edit relevant markdown files
- Ensure consistency with existing style
- Include examples where helpful
- Link to related sections

#### 5. **Tools & Integrations**
- GitHub Actions workflows
- VS Code extensions
- Figma plugins
- Claude Project configurations

**How to contribute:**
- Create tool in appropriate directory: `tools/[tool-name]/`
- Include setup instructions and examples
- Ensure tool is compatible with the framework
- Document dependencies

### Getting Started

#### For First-Time Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/[your-username]/Dev-Framework.git
   cd Dev-Framework
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following the style guide below
5. **Commit with a clear message:**
   ```bash
   git commit -m "feat: brief description of change
   
   Longer explanation if needed. Reference issues with #123."
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request** from your fork to the main repository

#### Before You Start

- Check existing issues and discussions to avoid duplicate work
- Comment on an issue saying you'd like to work on it
- For large changes, create an issue first to discuss approach

### Development Process

#### For Framework Changes

1. **Understand the impact** — Does this change affect multiple projects?
2. **Update documentation** — Update relevant .md files explaining the change
3. **Test in a real project** — Test in an active project
4. **Update templates** — If this is a new pattern, add to appropriate template
5. **Update CHANGELOG.md** — Document the change for the next release
6. **Get feedback** — Create an issue or discussion before a PR if unsure

#### For Skill Creation

1. **Study existing skills** — Review 2-3 existing skills to understand patterns
2. **Define inputs and outputs** — Be explicit about what the skill takes in and produces
3. **Create documentation** — Write SKILL.md following the template
4. **Test in context** — Use the skill in a Claude Project with a real project
5. **Refine based on testing** — Iterate based on real usage
6. **Include examples** — Provide before/after examples in the SKILL.md

### Style Guide

#### Markdown

- **Headers:** Use `#` for h1 (page title), `##` for h2 (sections), `###` for h3 (subsections)
- **Code blocks:** Specify language for syntax highlighting:
  ```markdown
  \`\`\`typescript
  // code here
  \`\`\`
  ```
- **Lists:** Use `-` for unordered, numbers for ordered
- **Links:** Use relative links: `[text](./path/to/file.md)`
- **Line length:** Aim for <100 characters for readability
- **Emphasis:** Use `**bold**` for important terms, `_italic_` for emphasis

#### File Naming

- **Directories:** lowercase, hyphens: `my-directory/`
- **Files:** CamelCase for documentation files: `MyFile.md`
- **Templates:** TEMPLATE suffix: `PROJECT_STATUS_TEMPLATE.md`
- **Skills:** SKILL.md suffix: `SKILL_my-skill.md`

#### Documentation Content

- Always explain the "why" before the "how"
- Include concrete examples, not abstract explanations
- Use tables for comparisons or quick reference
- Include links to related sections
- Mark incomplete sections with `⚠️ TODO:` or `🔨 In Progress`

### Code Standards

While this framework is primarily documentation, any code included should follow:

- **TypeScript:** Strict mode, no `any` types without justification
- **React:** Functional components with hooks, Tailwind CSS for styling
- **SQL:** Standard SQL formatting, clear naming conventions
- **Comments:** Explain why, not what. Good code is self-documenting.

### Quality Checklist Before Submitting PR

- [ ] Changes align with framework principles
- [ ] Documentation is clear and complete
- [ ] Markdown is properly formatted (no broken links)
- [ ] Examples are accurate and tested
- [ ] CHANGELOG.md is updated
- [ ] If skill: includes pre-generation checklist and quality rules
- [ ] If template: includes all expected files
- [ ] Commit messages are clear and descriptive

### Pull Request Process

1. **Fill out the PR template** (auto-generated)
2. **Reference related issues:** "Closes #123" or "Related to #456"
3. **Describe what changed and why**
4. **Include testing/validation steps**
5. **Link to any documentation you updated**

**Reviewers will:**
- Check alignment with framework principles
- Verify accuracy of technical content
- Ensure quality and clarity of documentation
- Request changes if needed
- Merge when approved

### Code Review Guidelines

**For reviewers:**

When reviewing contributions, consider:

1. **Framework Alignment** — Does this follow core principles?
2. **Scalability** — Would a 30-person team understand and follow this?
3. **Clarity** — Are examples clear? Would someone new get it?
4. **Consistency** — Does it match existing patterns and style?
5. **Completeness** — Are there any gaps or missing pieces?

**Be kind and constructive.** Provide suggestions, not criticism.

---

## Reporting Issues

Found a problem? Help us improve:

### Reporting Bugs

Use the **Bug Report** template:
- Clear title describing the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your environment (browser, OS, etc.)

### Suggesting Enhancements

Use the **Feature Request** template:
- Clear title
- Detailed description of the feature
- Why you need it
- Alternative solutions you've considered

### Questions or Discussions

Use **GitHub Discussions** for:
- Questions about how to use the framework
- Ideas for improvements (before creating an issue)
- Sharing experiences or lessons learned

---

## Recognition

Contributors will be recognized in:
- **CONTRIBUTORS.md** file (we'll create this when we have contributors)
- **Release notes** for significant contributions
- **GitHub contributor list** (automatic)

---

## Questions or Need Help?

- **GitHub Discussions:** Ask questions and share ideas
- **Issues:** Report problems or suggest features
- **Email:** Kirk Meldrum (if you need to reach out privately)

---

## Code of Conduct

By contributing, you agree to:
- Be respectful of others
- Provide constructive feedback
- Help others learn
- Give credit where due
- Report issues professionally

We reserve the right to remove contributions that violate this code of conduct.

---

## Legal

By submitting a pull request, you agree that:
- Your contribution is original work
- You have the right to license it under MIT License
- Your contribution does not violate any third-party rights

---

Thank you for contributing to making software development more efficient and accessible! 🚀
