import knex from 'knex';

const dbConfig = {
    client: 'mssql',
    connection: {
        host: 'localhost',
        port: 1433,
        user: 'sa',
        password: 'VU6ex?S6ICh',
        database: 'FoodGenieGemini',
        options: {
            enableArithAbort: true,
            trustServerCertificate: true
        }
    }
};

const db = knex(dbConfig);

const categoryHierarchy = [
    {
        name: 'Produce', slug: 'produce', children: [
            { name: 'Vegetables', slug: 'vegetables', keywords: ['onion', 'garlic', 'tomato', 'potato', 'carrot', 'pepper', 'cabbage', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'zucchini', 'celery', 'corn', 'squash', 'eggplant', 'kale', 'radish', 'asparagus', 'beet', 'cauliflower', 'pea', 'bean', 'yam', 'artichoke', 'leek', 'shallot', 'bok choy'] },
            { name: 'Fruits', slug: 'fruits', keywords: ['apple', 'banana', 'orange', 'berry', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'grape', 'lemon', 'lime', 'peach', 'pear', 'plum', 'cherry', 'mango', 'pineapple', 'melon', 'watermelon', 'cantaloupe', 'kiwi', 'apricot', 'fig', 'date', 'pomegranate', 'avocado', 'coconut'] },
            { name: 'Herbs & Mushrooms', slug: 'herbs-mushrooms', keywords: ['basil', 'cilantro', 'parsley', 'rosemary', 'thyme', 'oregano', 'mint', 'dill', 'chive', 'sage', 'tarragon', 'mushroom', 'crimini', 'shiitake', 'portobello', 'porcini'] }
        ]
    },
    {
        name: 'Meat & Poultry', slug: 'meat-poultry', children: [
            { name: 'Beef', slug: 'beef', keywords: ['beef', 'steak', 'roast beef', 'ground beef', 'chuck', 'sirloin', 'ribeye', 'brisket', 'veal'] },
            { name: 'Pork', slug: 'pork', keywords: ['pork', 'bacon', 'ham', 'sausage', 'lard', 'prosciutto', 'pancetta', 'chorizo'] },
            { name: 'Chicken & Poultry', slug: 'poultry', keywords: ['chicken', 'turkey', 'duck', 'goose', 'quail', 'hen'] },
            { name: 'Deli & Cured Meats', slug: 'deli-meats', keywords: ['salami', 'pepperoni', 'pastrami', 'bologna', 'hot dog', 'frankfurter'] }
        ]
    },
    {
        name: 'Seafood', slug: 'seafood', children: [
            { name: 'Fish', slug: 'fish', keywords: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'trout', 'halibut', 'anchovy', 'sardine', 'catfish', 'snapper', 'bass'] },
            { name: 'Shellfish', slug: 'shellfish', keywords: ['shrimp', 'crab', 'lobster', 'mussel', 'clam', 'scallop', 'oyster', 'prawn', 'squid', 'octopus'] }
        ]
    },
    {
        name: 'Dairy & Eggs', slug: 'dairy-eggs', children: [
            { name: 'Milk & Cream', slug: 'milk-cream', keywords: ['milk', 'cream', 'half and half', 'buttermilk'] },
            { name: 'Cheese', slug: 'cheese', keywords: ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'ricotta', 'provolone', 'gouda', 'swiss', 'jack', 'brie', 'camembert', 'pecorino', 'asiago'] },
            { name: 'Yogurt & Butter', slug: 'yogurt-butter', keywords: ['yogurt', 'butter', 'margarine', 'ghee', 'sour cream'] },
            { name: 'Eggs', slug: 'eggs', keywords: ['egg', 'yolk', 'egg white'] }
        ]
    },
    {
        name: 'Pantry Staples', slug: 'pantry', children: [
            { name: 'Grains, Rice & Pasta', slug: 'grains-pasta', keywords: ['rice', 'pasta', 'spaghetti', 'penne', 'noodle', 'quinoa', 'oat', 'barley', 'couscous', 'polenta', 'cornmeal'] },
            { name: 'Baking Supplies', slug: 'baking', keywords: ['flour', 'sugar', 'baking powder', 'baking soda', 'yeast', 'cocoa', 'vanilla', 'chocolate chip', 'molasses', 'syrup', 'honey'] },
            { name: 'Oils & Vinegars', slug: 'oils-vinegars', keywords: ['oil', 'olive oil', 'vegetable oil', 'vinegar', 'balsamic', 'cider vinegar'] },
            { name: 'Spices & Seasonings', slug: 'spices', keywords: ['salt', 'pepper', 'cinnamon', 'cumin', 'paprika', 'turmeric', 'coriander', 'clove', 'nutmeg', 'allspice', 'ginger', 'curry', 'chili powder', 'cayenne', 'octo'] },
            { name: 'Condiments & Sauces', slug: 'condiments', keywords: ['ketchup', 'mustard', 'mayo', 'mayonnaise', 'soy sauce', 'hot sauce', 'salsa', 'relish', 'dressing', 'marinara', 'pesto', 'teriyaki', 'worcestershire'] },
            { name: 'Canned Goods', slug: 'canned-goods', keywords: ['canned', 'broth', 'stock', 'soup', 'bean', 'chickpea', 'lentil', 'tomato paste', 'tomato sauce'] },
            { name: 'Nuts & Seeds', slug: 'nuts-seeds', keywords: ['almond', 'walnut', 'peanut', 'cashew', 'pecan', 'pistachio', 'pine nut', 'sunflower seed', 'chia seed', 'flax seed', 'sesame seed'] }
        ]
    },
    { name: 'Beverages', slug: 'beverages', keywords: ['water', 'juice', 'soda', 'tea', 'coffee', 'wine', 'beer', 'whiskey', 'rum', 'vodka', 'liqueur', 'brandy'] },
    { name: 'Bakery', slug: 'bakery', keywords: ['bread', 'roll', 'bun', 'bagel', 'tortilla', 'pita', 'croissant', 'muffin', 'pastry'] },
    { name: 'Frozen Foods', slug: 'frozen', keywords: ['frozen'] },
    { name: 'Snacks & Sweets', slug: 'snacks', keywords: ['chip', 'cracker', 'pretzels', 'popcorn', 'candy', 'chocolate', 'cookie', 'gelatin', 'pudding'] }
];

async function enrichTaxonomy() {
    console.log('Enriching Taxonomy...');

    // 1. Cleanup junk categories (Supplies)
    console.log('Cleaning up junk categories...');
    await db('food_categories').where('id', '>=', 43).del();

    // 2. Sync Standard Hierarchy
    console.log('Syncing category hierarchy...');
    const catMap = new Map<string, number>(); // slug -> id

    for (const root of categoryHierarchy) {
        let existing = await db('food_categories').where('slug', root.slug).first();
        let rootId: number;
        if (!existing) {
            const [idObj] = await db('food_categories').insert({
                name: root.name,
                slug: root.slug,
                depth: 0
            }).returning('id');
            rootId = typeof idObj === 'object' ? idObj.id : idObj;
        } else {
            rootId = existing.id;
            await db('food_categories').where('id', rootId).update({ name: root.name });
        }
        catMap.set(root.slug, rootId);

        if (root.children) {
            for (const child of root.children) {
                let cExisting = await db('food_categories').where('slug', child.slug).first();
                let childId: number;
                if (!cExisting) {
                    const [idObj] = await db('food_categories').insert({
                        name: child.name,
                        slug: child.slug,
                        depth: 1,
                        parent_id: rootId
                    }).returning('id');
                    childId = typeof idObj === 'object' ? idObj.id : idObj;
                } else {
                    childId = cExisting.id;
                    await db('food_categories').where('id', childId).update({ name: child.name, parent_id: rootId });
                }
                catMap.set(child.slug, childId);
            }
        }
    }

    // 3. Map Ingredients
    console.log('Mapping ingredients to categories...');
    const ingredients = await db('ingredients').select('id', 'name');
    let mappedCount = 0;

    // Build flattened keyword map for fast matching
    const keywordRules: { categoryId: number, keywords: string[] }[] = [];
    for (const root of categoryHierarchy) {
        if (root.children) {
            for (const child of root.children) {
                keywordRules.push({ categoryId: catMap.get(child.slug)!, keywords: child.keywords || [] });
            }
        }
        if (root.keywords) {
            keywordRules.push({ categoryId: catMap.get(root.slug)!, keywords: root.keywords });
        }
    }

    // Sort keyword rules: more specific keywords or child categories first?
    // Actually, we'll just iterate.

    for (const ingr of ingredients) {
        let bestCategoryId: number | null = null;
        let bestMatchScore = 0;

        for (const rule of keywordRules) {
            for (const kw of rule.keywords) {
                if (ingr.name.toLowerCase().includes(kw)) {
                    // Score based on keyword length to prefer "ground beef" over "beef"
                    if (kw.length > bestMatchScore) {
                        bestMatchScore = kw.length;
                        bestCategoryId = rule.categoryId;
                    }
                }
            }
        }

        if (bestCategoryId) {
            await db('ingredients').where('id', ingr.id).update({ category_id: bestCategoryId });
            mappedCount++;
        }
    }

    console.log(`Successfully mapped ${mappedCount} / ${ingredients.length} ingredients.`);
    console.log('Taxonomy enrichment complete!');
    await db.destroy();
}

enrichTaxonomy().catch(console.error);
