// ============================================
// Recipe Parser Service
// Extract structured recipe data from URLs and Text
// ============================================

export interface ExtractedRecipe {
    title: string;
    description: string;
    image?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    cuisine?: string;
    ingredients: string[]; // Raw strings for now
    steps: string[];
    sourceUrl?: string;
}

/**
 * Main parse entry point: URL
 */
export async function parseUrl(url: string): Promise<{ data: ExtractedRecipe; method: 'json-ld' | 'ai' }> {
    // 1. Fetch the page HTML
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not fetch the URL: ${response.statusText}`);
    const html = await response.text();

    // 2. Try JSON-LD extraction
    const jsonLd = extractJsonLd(html);
    if (jsonLd) {
        return { data: jsonLd, method: 'json-ld' };
    }

    // 3. Fallback to AI extraction (Mock for now)
    // In a real scenario, we'd call Claude via SDK here.
    return { data: await mockAiExtract(html), method: 'ai' };
}

/**
 * Main parse entry point: Text
 */
export async function parseText(text: string): Promise<ExtractedRecipe> {
    // Treat raw text as AI-required
    return await mockAiExtract(text);
}

/**
 * Extract data from JSON-LD Schema.org/Recipe
 */
function extractJsonLd(html: string): ExtractedRecipe | null {
    try {
        const scriptMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
        if (!scriptMatch) return null;

        for (const scriptTag of scriptMatch) {
            const rawJson = scriptTag.replace(/<script type="application\/ld\+json">|<\/script>/gi, '').trim();
            const json = JSON.parse(rawJson);

            // Schema might be a single object, an array, or a @graph
            const recipes = findRecipesInJson(json);
            if (recipes && recipes.length > 0) {
                const r = recipes[0];
                return {
                    title: r.name || "",
                    description: r.description || "",
                    image: typeof r.image === 'string' ? r.image : (Array.isArray(r.image) ? r.image[0] : (r.image?.url || "")),
                    prepTime: parseIsoDuration(r.prepTime),
                    cookTime: parseIsoDuration(r.cookTime),
                    servings: parseInt(r.recipeYield?.toString()) || undefined,
                    cuisine: r.recipeCuisine,
                    ingredients: r.recipeInstructions ? r.recipeIngredient : [], // Basic extract
                    steps: Array.isArray(r.recipeInstructions)
                        ? r.recipeInstructions.map((s: any) => typeof s === 'string' ? s : s.text)
                        : (r.recipeInstructions ? [r.recipeInstructions] : [])
                };
            }
        }
    } catch (err) {
        console.error("JSON-LD parse error:", err);
    }
    return null;
}

/**
 * Recursively find @type: Recipe in JSON block
 */
function findRecipesInJson(obj: any): any[] {
    const results: any[] = [];
    if (!obj || typeof obj !== 'object') return results;

    if (obj['@type'] === 'Recipe' || obj['@type']?.includes('Recipe')) {
        results.push(obj);
    }

    const targets = obj['@graph'] || (Array.isArray(obj) ? obj : Object.values(obj));
    for (const val of targets) {
        if (typeof val === 'object') {
            results.push(...findRecipesInJson(val));
        }
    }
    return results;
}

/**
 * Parse ISO 8601 Duration (PT30M) to minutes
 */
function parseIsoDuration(duration?: string): number | undefined {
    if (!duration) return undefined;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return undefined;
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
}

/**
 * Mock AI Extraction for Prototype
 */
async function mockAiExtract(_content: string): Promise<ExtractedRecipe> {
    // This would be replaced by a real prompt/completion
    return {
        title: "Mock AI Extracted Recipe",
        description: "This recipe was extracted using mock AI. In production, this would call Claude.",
        ingredients: ["1 cup flour", "2 eggs", "1/2 cup sugar"],
        steps: ["Mix the ingredients.", "Bake at 350F for 20 minutes."],
        cuisine: "American"
    };
}
