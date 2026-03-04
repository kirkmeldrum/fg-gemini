# Bulk Data Migration Guide — Legacy to Modern FoodGenie

This document details the process, scripts, and logic used to migrate the legacy Allrecipes dataset (48k+ recipes) into the modernized FoodGenie SQL Server database.

---

## 1. Source Data
The migration leveraged two primary source files provided from the legacy OneDrive archive:

*   **Canonical Recipe Data (Full SQL Dump)**: 
    *   **Path**: `C:\Users\kirkm\OneDrive\FOODGENIE\Data\RecipeIndexingScripts\Databases\FoodGenie_test_FULL_DB_1_8_13.sql`
    *   **Version**: Jan 8, 2013 (219MB)
    *   **Content**: Full metadata, ingredients (HTML), directions (HTML), and nutrition data for 48,483 recipes.
    *   **Why**: Earlier 60MB versions were found to be truncated (missing ~30k instructions).

---

## 2. Migration Pipeline

The process was split into two stages: **Extraction** (converting raw files to structured JSON) and **Ingestion** (uploading JSON to the database).

### Phase A: Unified Extraction
**Script**: `scripts/migration/bulk_extract.ts`

This script handles the heavy lifting of parsing legacy formats:
1.  **SQL Parsing**: Implements a custom state-aware parser to extract values from `INSERT INTO` statements, handling escaped quotes and multi-line content.
2.  **HTML Cleaning**: Strips legacy tags (e.g., `<span class="calories">`) and converts HTML entities (`&amp;` -> `&`) to plain text.
3.  **Instruction Extraction**: Splits HTML lists (`<li>`) into a structured array of steps.
4.  **Unified Ingredient Extraction**: Pulls ingredients directly from the HTML `ingr` column in the SQL row context. This eliminates the ID scrambling issue found when using external CSV files.

**Outputs**:
*   `data/migration/bulk_recipes.json` (~25MB)
*   `data/migration/bulk_ingredients.json` (~77MB)

### Phase B: Database Ingestion
**Script**: `scripts/migration/bulk_import.ts`

This script handles the structured upload to SQL Server:
1.  **Ingredient Syncing**: Identifies all unique ingredient names from the 400k+ rows, de-duplicates them, generates slugs, and seeds the `ingredients` table.
2.  **Batch Transactions**: Processes recipes in chunks of **100** per transaction. This ensures high performance while preventing memory overflows or log-file bloat.
3.  **Constraint Protection**: Automatically truncates strings to meet database schema limits (e.g., `title` to 200 chars, `unit` to 50 chars) to prevent "String or binary data would be truncated" errors.
4.  **Referential Integrity**: Links `recipe_ingredients` to the newly created canonical `ingredients` IDs and the `recipes` table.

---

## 3. Key Technical Decisions

*   **Slugification**: Used a standard slugify logic during import to ensure SEO-friendly and unique URLs for every recipe and ingredient.
*   **Transaction Logic**: Used `db.transaction()` blocks. If any step or ingredient in a chunk fails, the entire chunk is rolled back to prevent orphaned data.
*   **Memory Management**: Leveraged `readline` and `fs.createReadStream` for extraction to handle large 100MB+ files without crashing the Node.js process.

---

## 4. Final Audit Results (2026-03-01)

| Entity | Count | Status |
| :--- | :--- | :--- |
| **Recipes** | 46,730 | Successfully Ingested |
| **Unique Ingredients** | 8,724 | Synced & Canonicalized |
| **Recipe-Ingredient Links**| 396,039 | Completed |

---

## 5. How to Re-Run the Process

If you need to replicate this in another project or refresh the current database:

1.  **Verify Source Paths**: Ensure the OneDrive paths in the scripts match the target environment.
2.  **Extract**:
    ```bash
    pnpm exec tsx scripts/migration/bulk_extract.ts
    ```
3.  **Import**:
    ```bash
    pnpm --filter @foodgenie/api exec tsx ../../scripts/migration/bulk_import.ts
    ```

---
*Created by Antigravity AI for FoodGenie Modernization Project.*
