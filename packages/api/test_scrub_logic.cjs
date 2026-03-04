
function scrubIngredientLabel(name) {
    let clean = name.toLowerCase()
        // 0. Preliminary cleanup of messed up characters
        .replace(/┬«/g, '')
        .replace(/Γäó/g, '')
        .replace(/[®™]/g, '')

        // 1. Broadly remove leading measurements in parentheses e.g. (1 1/2 inch)
        .replace(/^\(.*?\)[\s,]*/, '')

        // 2. Remove parentheticals or ones in the middle (handling unclosed)
        .replace(/\s*\(.*?(?:\)|$)/g, '');

    // 3. Loop slightly to catch recursive prefixes like "+ 1 tablespoon + 1 teaspoon"
    let last = '';
    while (clean !== last) {
        last = clean;
        clean = clean
            .replace(/^[\d\.\s\/-]+/, '')
            .replace(/^(additional|and|or|\+)\s+/i, '')
            .replace(/^(cup|tablespoon|teaspoon|oz|ounce|pound|lb|can|package|bag|clove|slice|medium|small|large|stick|dash|pinch|drop|gram|kg|ml|liter|envelope|jar|piece|recipe|box|head|stalk|bunch|tin|container|link|bottle)s?(\s+of)?\s+/i, '')
            .replace(/^(chopped|minced|sliced|diced|grated|shredded|crushed|melted|beaten|prepared|warm|hot|ice\s+cold|cold|fresh|freshly|pureed|softened|sifted|toasted|roasted)\s+/i, '')
            .trim();
    }

    // 4. Remove trailing artifacts
    clean = clean
        .replace(/,\s+.*$/, '')     // everything after comma
        .replace(/\s+-\s+.*$/, '')  // everything after dash
        .replace(/\s+to taste.*$/i, '')
        .replace(/\s+as needed.*$/i, '')
        .replace(/\s+optional.*$/i, '')
        .replace(/\s+for garnish.*$/i, '')
        .replace(/\s+for serving.*$/i, '')
        .replace(/\s+for coating.*$/i, '')
        .replace(/\s+sliced into.*$/i, '')
        .replace(/:$/, '')
        .trim();

    return clean;
}

const samples = [
    "% cocoa dark chocolate",
    "(2x2-inch) sourdough bread slices",
    "(yellow or purple) onion",
    "+ 1 tablespoon + 1 teaspoon all-purpose flour",
    "additional cheddar cheese (optional)",
    "additional strawberry preserves (optional)",
    "additional smucker's┬« chocolate sundae syrups ice cream topping",
    "adobo sauce (from a can of chipotles in adobo sauce)",
    "al fresco┬« all natural roasted garlic chicken sausage sliced into 1/4-inch pieces (2 links)",
    "alfalfa sprouts (optional)",
    "all-purpose flour (1 kings 4:22)",
    "anchovy fillets packed in olive oil",
    "apple - peeled",
    "apple (such as honey crisp)",
    "apples - peeled",
    "apricot jam (if using jam",
    "baby bella mushrooms (brown mushrooms",
    "bacon - cooked and crumbled (optional)"
];

console.log("OLD -> NEW");
samples.forEach(s => {
    console.log(`${s} -> ${scrubIngredientLabel(s)}`);
});
