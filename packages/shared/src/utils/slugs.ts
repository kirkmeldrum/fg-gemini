/**
 * Generate a URL-friendly slug from a title string.
 * - Lowercase
 * - Spaces -> hyphens
 * - Removes special characters
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
