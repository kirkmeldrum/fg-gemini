### Artifact 3: `SKILL_laravel-app-generator.md` (Supports Stack F)
```markdown
---
name: laravel-app-generator
description: >
  Generates enterprise PHP code using the Laravel 12.x framework. Use when working in 
  Stack F. Generates Eloquent Models, FormRequests for validation, Services for business 
  logic, and Controllers. Enforces "Thin Controller, Fat Service" architecture.
---

# Laravel Application Generator

## Purpose
Generate strictly-typed, scalable PHP backends.

## File Generation Order
1. **Migration & Model:** `php artisan make:model Item -m`
2. **Form Request:** `php artisan make:request StoreItemRequest`
3. **Service Class:** `app/Services/ItemService.php`
4. **Controller:** `app/Http/Controllers/ItemController.php`

## Rules
* **Validation:** NEVER validate in the controller. Always generate and inject a FormRequest.
* **Typing:** Use strict typing for all PHP methods (`public function store(array $data): Item`).
* **Database:** Use Eloquent ORM. Never use raw `DB::statement()` unless performing complex aggregations. Use Resource classes (`ItemResource`) to format API responses.