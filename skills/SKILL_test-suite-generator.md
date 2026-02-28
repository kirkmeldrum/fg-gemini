---
name: test-suite-generator
description: >
  Generates automated test suites (Unit, Integration, E2E) mapped directly to requirements.
  Use when: user says "write tests for", "generate test suite", "automate QA for", or 
  when entering Phase 5 (Validate). Supports Jest/Vitest for React/Node, Pest/PHPUnit 
  for Laravel, and XCTest for Swift. Always reads REQUIREMENTS.md first to ensure every 
  acceptance criterion becomes a discrete test case.
---

# Test Suite Generator

## Purpose
Translate REQ-XXX acceptance criteria into executable, automated test code to eliminate manual regression testing and enforce Gate 5 quality checks.

## Process

### Step 1: Read the Requirements
Read `REQUIREMENTS.md` for the specific feature being tested. Identify every single testable acceptance criterion.

### Step 2: Determine Test Layer & Framework
* **Frontend Components:** Vitest/React Testing Library
* **Backend APIs (Node):** Jest + Supertest
* **Backend APIs (PHP):** Pest or PHPUnit
* **Mobile (iOS):** XCTest (Unit & UI)
* **End-to-End:** Playwright

### Step 3: Generate the Suite
Generate tests following the AAA pattern (Arrange, Act, Assert).

```typescript
// Example Output (Jest/Supertest for API)
import request from 'supertest';
import { app } from '../app';
import { db } from '../config/database';

describe('REQ-001: Item Creation API', () => {
  beforeEach(async () => { await db('items').truncate(); });

  it('REQ-001.1: Returns 201 and creates item on valid payload', async () => {
    // Arrange
    const payload = { name: 'Test Item', categoryId: 1 };
    
    // Act
    const res = await request(app).post('/api/items').send(payload);
    
    // Assert
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  it('REQ-001.2: Returns 400 Validation Error if name is missing', async () => {
    const res = await request(app).post('/api/items').send({ categoryId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});