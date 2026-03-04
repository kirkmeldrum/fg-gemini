/**
 * Centralized utility for normalizing image URLs returned from the API.
 * This translates local storage protocols (like local://) into valid HTTP paths
 * served by the Express static route.
 */
export function transformImageUrl(url: string | null): string | null {
    if (!url) return null;

    if (url.startsWith('local://')) {
        // Translate local://702856.jpg -> /api/images/local/702856.jpg
        return `/api/images/local/${url.replace('local://', '')}`;
    }

    return url;
}

/**
 * Transforms an array of objects containing an image_url property.
 */
export function transformRecipeImages<T extends { image_url: string | null }>(items: T[]): T[] {
    return items.map(item => ({
        ...item,
        image_url: transformImageUrl(item.image_url)
    }));
}
