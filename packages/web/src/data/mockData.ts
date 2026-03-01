

// Types reflecting the Database Schema defined in the architecture

export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string;
  joined_date?: string;
  stats?: {
    recipes: number;
    followers: number;
    following: number;
  };
  preferences?: {
    diets: string[];
    allergies: string[];
    dislikes: string[];
  };
};

// --- Food Ontology (Materialized Path) ---
export type FoodNode = {
  id: number;
  name: string;
  path: string; // e.g., "/1/5/12/"
  parent_id: number | null;
  type: 'category' | 'generic_food' | 'branded_product';
  description?: string;
  image?: string;
  // Enhanced Fields
  nutrition?: {
    calories: number; // per 100g
    protein: string;
    fat: string;
    carbs: string;
  };
  pairings?: string[];
  storage?: string;
};

export type PantryItem = {
  id: number;
  food_node_id: number; // Links to FoodNode
  quantity: number;
  unit: string;
  location: 'fridge' | 'pantry' | 'freezer' | 'spice_rack';
  expiration_date: string | null;
};

export type RecipeIngredient = {
  food_node_id: number;
  quantity: number;
  unit: string;
  notes?: string;
};

export type Recipe = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  image_url?: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories: number;
  cuisine: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  author: User;
};

export type Review = {
  id: number;
  recipe_id: number;
  user: User;
  rating: number;
  comment: string;
  date: string;
};

export type ShoppingItem = {
  id: number;
  food_node_id: number | null;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  category: string;
};

export type MealPlanItem = {
  id: number;
  day: string;
  slot: 'breakfast' | 'lunch' | 'dinner';
  recipe_id: number | null;
  note?: string;
};

export type Friend = User & {
  status: 'connected' | 'pending_incoming' | 'pending_outgoing';
  mutual_friends: number;
};

export type Activity = {
  id: number;
  user_id: number;
  type: 'recipe_posted' | 'review_added' | 'joined_challenge';
  title: string;
  description: string;
  timestamp: string;
  likes: number;
  comments: number;
  image?: string;
};

// --- Mock Data: Food Ontology ---
export const FOOD_ONTOLOGY: FoodNode[] = [
  // Roots
  { id: 1, name: "Food", path: "/1/", parent_id: null, type: "category", description: "The root of all edible items." },

  // Animal Products
  { id: 2, name: "Animal Products", path: "/1/2/", parent_id: 1, type: "category", description: "Foods derived from animals." },

  // Dairy
  {
    id: 3,
    name: "Dairy",
    path: "/1/2/3/",
    parent_id: 2,
    type: "category",
    description: "Milk and products produced from milk.",
    storage: "Always keep refrigerated below 40°F (4°C).",
    nutrition: { calories: 60, protein: "3g", fat: "3.2g", carbs: "4.5g" }
  },
  {
    id: 12,
    name: "Milk",
    path: "/1/2/3/12/",
    parent_id: 3,
    type: "generic_food",
    description: "Nutrient-rich liquid food produced by the mammary glands of mammals.",
    nutrition: { calories: 42, protein: "3.4g", fat: "1g", carbs: "5g" },
    pairings: ["Cookies", "Cereal", "Coffee", "Chocolate"],
    storage: "Keep refrigerated. Do not store in door as temperature fluctuates."
  },
  {
    id: 13,
    name: "Cheese",
    path: "/1/2/3/13/",
    parent_id: 3,
    type: "category",
    description: "Dairy product derived from milk that is produced in a wide range of flavors, textures, and forms.",
    pairings: ["Wine", "Crackers", "Fruit", "Bread"],
    storage: "Wrap in wax paper or cheese paper to allow it to breathe."
  },
  {
    id: 14,
    name: "Cheddar Cheese",
    path: "/1/2/3/13/14/",
    parent_id: 13,
    type: "generic_food",
    description: "A relatively hard, off-white (or orange if colored), sometimes sharp-tasting, natural cheese.",
    nutrition: { calories: 402, protein: "25g", fat: "33g", carbs: "1.3g" },
    pairings: ["Apples", "Burgers", "Stout Beer", "Chardonnay"],
    storage: "Refrigerate. Can be frozen but texture may become crumbly."
  },
  {
    id: 15,
    name: "Butter",
    path: "/1/2/3/15/",
    parent_id: 3,
    type: "generic_food",
    description: "Dairy product made from the fat and protein components of milk or cream.",
    nutrition: { calories: 717, protein: "0.85g", fat: "81g", carbs: "0.06g" },
    pairings: ["Bread", "Corn", "Potatoes", "Steak"],
    storage: "Refrigerate for up to 3 months or freeze for up to 1 year."
  },

  // Eggs
  {
    id: 4,
    name: "Eggs",
    path: "/1/2/4/",
    parent_id: 2,
    type: "generic_food",
    image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=400&q=80",
    description: "A staple food laid by female animals of many different species, including birds, reptiles, amphibians, and fish.",
    nutrition: { calories: 155, protein: "13g", fat: "11g", carbs: "1.1g" },
    pairings: ["Bacon", "Toast", "Avocado", "Hot Sauce"],
    storage: "Store in the carton in the main body of the refrigerator."
  },

  // Meat Category
  { id: 5, name: "Meat", path: "/1/2/5/", parent_id: 2, type: "category" },
  { id: 6, name: "Pork", path: "/1/2/5/6/", parent_id: 5, type: "category" },
  { id: 8, name: "Cured Pork", path: "/1/2/5/6/8/", parent_id: 6, type: "category" },

  // Bacon
  {
    id: 9,
    name: "Bacon",
    path: "/1/2/5/6/8/9/",
    parent_id: 8,
    type: "generic_food",
    description: "Cured meat prepared from a pig. It is first cured using large amounts of salt, either in a brine or in a dry packing.",
    image: "https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=400&q=80",
    nutrition: { calories: 541, protein: "37g", fat: "42g", carbs: "1.4g" },
    pairings: ["Eggs", "Maple Syrup", "Burgers", "Dates"],
    storage: "Keep refrigerated below 40°F. Use within 7 days of opening."
  },
  {
    id: 90,
    name: "Oscar Mayer Bacon",
    path: "/1/2/5/6/8/9/90/",
    parent_id: 9,
    type: "branded_product",
    description: "Specific brand of bacon known for its hardwood smoked flavor."
  },

  // Poultry
  { id: 7, name: "Poultry", path: "/1/2/5/7/", parent_id: 5, type: "category" },
  {
    id: 10,
    name: "Chicken",
    path: "/1/2/5/7/10/",
    parent_id: 7,
    type: "generic_food",
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80",
    description: "The most common type of poultry in the world.",
    pairings: ["Lemon", "Garlic", "Thyme", "Rosemary"]
  },
  {
    id: 11,
    name: "Chicken Breast",
    path: "/1/2/5/7/10/11/",
    parent_id: 10,
    type: "generic_food",
    nutrition: { calories: 165, protein: "31g", fat: "3.6g", carbs: "0g" },
    storage: "Keep refrigerated. Use within 1-2 days of purchase or freeze."
  },

  // Plant Products
  { id: 20, name: "Plant Products", path: "/1/20/", parent_id: 1, type: "category" },

  // Grains
  { id: 21, name: "Grains & Cereals", path: "/1/20/21/", parent_id: 20, type: "category" },
  { id: 24, name: "Wheat", path: "/1/20/21/24/", parent_id: 21, type: "category" },
  {
    id: 25,
    name: "Flour",
    path: "/1/20/21/24/25/",
    parent_id: 24,
    type: "generic_food",
    storage: "Store in an airtight container in a cool, dry place. Freeze for longer shelf life."
  },
  { id: 26, name: "Pasta", path: "/1/20/21/24/26/", parent_id: 24, type: "category" },
  { id: 27, name: "Spaghetti", path: "/1/20/21/24/26/27/", parent_id: 26, type: "generic_food" },

  // Vegetables
  { id: 22, name: "Vegetables", path: "/1/20/22/", parent_id: 20, type: "category" },
  { id: 30, name: "Allium", path: "/1/20/22/30/", parent_id: 22, type: "category" },
  {
    id: 31,
    name: "Onion",
    path: "/1/20/22/30/31/",
    parent_id: 30,
    type: "generic_food",
    storage: "Store in a cool, dark, well-ventilated place. Do not store with potatoes."
  },
  {
    id: 32,
    name: "Garlic",
    path: "/1/20/22/30/32/",
    parent_id: 30,
    type: "generic_food",
    storage: "Store whole heads in a cool, dry, dark place."
  },
  { id: 33, name: "Leafy Greens", path: "/1/20/22/33/", parent_id: 22, type: "category" },
  { id: 34, name: "Lettuce", path: "/1/20/22/33/34/", parent_id: 33, type: "generic_food", storage: "Wrap in damp paper towels and place in a perforated plastic bag in the crisper." },
  { id: 35, name: "Nightshades", path: "/1/20/22/35/", parent_id: 22, type: "category" },
  { id: 36, name: "Tomato", path: "/1/20/22/35/36/", parent_id: 35, type: "generic_food", pairings: ["Basil", "Mozzarella", "Olive Oil", "Balsamic"] },
  { id: 37, name: "Tomato Sauce", path: "/1/20/22/35/36/37/", parent_id: 36, type: "generic_food" },

  // Fruits
  { id: 23, name: "Fruits", path: "/1/20/23/", parent_id: 20, type: "category" },

  // Misc
  { id: 40, name: "Sugars", path: "/1/40/", parent_id: 1, type: "category" },
  { id: 41, name: "White Sugar", path: "/1/40/41/", parent_id: 40, type: "generic_food" },
];

export const USERS: User[] = [
  {
    id: 1,
    name: "Julia Wysocki",
    email: "julia@foodgenie.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    bio: "Home cook enthusiast who loves Italian cuisine and baking. Trying to reduce food waste!",
    location: "Chicago, IL",
    joined_date: "Member since 2023",
    stats: { recipes: 12, followers: 45, following: 32 },
    preferences: {
      diets: ["Vegetarian", "Low Carb"],
      allergies: ["Peanuts"],
      dislikes: ["Mushrooms", "Olives"]
    }
  },
  {
    id: 2,
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    bio: "Professional Chef exploring home cooking techniques.",
    location: "San Francisco, CA",
    preferences: { diets: [], allergies: [], dislikes: [] }
  },
  {
    id: 3,
    name: "Sarah Miller",
    email: "sarah@example.com",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    bio: "Busy mom looking for quick and healthy meals.",
    location: "Austin, TX",
    preferences: { diets: ["Gluten Free"], allergies: [], dislikes: [] }
  },
  {
    id: 4,
    name: "Mike Ross",
    email: "mike@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e290260244",
    location: "New York, NY",
    preferences: { diets: [], allergies: ["Shellfish"], dislikes: [] }
  },
];

export const RECIPES: Recipe[] = [
  {
    id: 1,
    title: "Classic Spaghetti Carbonara",
    slug: "classic-spaghetti-carbonara",
    description: "A quick and easy Italian pasta dish using eggs, cheese, and bacon.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
    image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
    prep_time: 10,
    cook_time: 15,
    servings: 4,
    calories: 650,
    cuisine: "Italian",
    tags: [],
    ingredients: [
      { food_node_id: 4, quantity: 3, unit: "large" }, // Eggs
      { food_node_id: 14, quantity: 1, unit: "cup" },   // Cheddar
      { food_node_id: 27, quantity: 400, unit: "g" },   // Spaghetti
      { food_node_id: 32, quantity: 2, unit: "cloves" }, // Garlic
      { food_node_id: 9, quantity: 200, unit: "g" }   // Bacon
    ],
    author: USERS[0]
  },
  {
    id: 2,
    title: "Grilled Chicken Salad",
    slug: "grilled-chicken-salad",
    description: "Healthy and fresh salad with grilled chicken breast.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    prep_time: 15,
    cook_time: 10,
    servings: 2,
    calories: 320,
    cuisine: "American",
    tags: ["Healthy", "Gluten Free", "Low Carb"],
    ingredients: [
      { food_node_id: 11, quantity: 2, unit: "pieces" }, // Chicken Breast
      { food_node_id: 31, quantity: 1, unit: "medium" }, // Onion
      { food_node_id: 34, quantity: 1, unit: "head" } // Lettuce
    ],
    author: USERS[0]
  },
  {
    id: 3,
    title: "Homemade Pancakes",
    slug: "homemade-pancakes",
    description: "Fluffy pancakes perfect for breakfast.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    prep_time: 10,
    cook_time: 15,
    servings: 4,
    calories: 450,
    cuisine: "American",
    tags: ["Vegetarian", "Breakfast"],
    ingredients: [
      { food_node_id: 4, quantity: 2, unit: "large" }, // Eggs
      { food_node_id: 12, quantity: 1, unit: "cup" },   // Milk
      { food_node_id: 25, quantity: 2, unit: "cups" },  // Flour
      { food_node_id: 15, quantity: 50, unit: "g" }     // Butter
    ],
    author: USERS[0]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  { id: 1, recipe_id: 1, user: USERS[1], rating: 5, comment: "Authentic and delicious! My kids loved it.", date: "2023-10-15" },
  { id: 2, recipe_id: 1, user: USERS[2], rating: 4, comment: "Great base recipe, but I added more pepper.", date: "2023-10-18" },
  { id: 3, recipe_id: 3, user: USERS[3], rating: 5, comment: "Fluffiest pancakes ever! The butter quantity is perfect.", date: "2023-10-20" }
];

// Initial Inventory State
export const INITIAL_PANTRY: PantryItem[] = [
  { id: 1, food_node_id: 4, quantity: 6, unit: "large", location: "fridge", expiration_date: "2023-12-01" }, // Eggs
  { id: 2, food_node_id: 12, quantity: 0.5, unit: "gallon", location: "fridge", expiration_date: "2023-11-20" }, // Milk
  { id: 3, food_node_id: 25, quantity: 1, unit: "kg", location: "pantry", expiration_date: null }, // Flour
  { id: 4, food_node_id: 32, quantity: 5, unit: "bulbs", location: "pantry", expiration_date: null }, // Garlic
  { id: 5, food_node_id: 90, quantity: 1, unit: "pack", location: "fridge", expiration_date: null }, // Oscar Mayer Bacon
];

export const INITIAL_SHOPPING_LIST: ShoppingItem[] = [
  { id: 1, food_node_id: 9, name: "Bacon", quantity: 200, unit: "g", checked: false, category: "Meat" },
  { id: 2, food_node_id: 27, name: "Spaghetti", quantity: 1, unit: "box", checked: true, category: "Pantry" },
  { id: 3, food_node_id: 11, name: "Chicken Breast", quantity: 2, unit: "lbs", checked: false, category: "Meat" },
  { id: 4, food_node_id: 34, name: "Lettuce", quantity: 1, unit: "head", checked: false, category: "Produce" },
];

export const INITIAL_MEAL_PLAN: MealPlanItem[] = [
  { id: 1, day: "Monday", slot: "dinner", recipe_id: 1, note: "" },
  { id: 2, day: "Tuesday", slot: "lunch", recipe_id: 2, note: "" },
  { id: 3, day: "Sunday", slot: "breakfast", recipe_id: 3, note: "Family brunch" },
];

export const FRIENDS: Friend[] = [
  { ...USERS[1], status: 'connected', mutual_friends: 12 },
  { ...USERS[2], status: 'connected', mutual_friends: 5 },
  { ...USERS[3], status: 'pending_incoming', mutual_friends: 3 },
];

export const ACTIVITIES: Activity[] = [
  {
    id: 1,
    user_id: 2,
    type: 'recipe_posted',
    title: 'Posted a new recipe',
    description: 'Just perfected my grandmothers spicy ramen recipe! Check it out.',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 5,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
  }
];

// --- API Simulation Service ---

export const api = {
  getFoodNodes: () => Promise.resolve(FOOD_ONTOLOGY),
  getFoodNode: (id: number) => Promise.resolve(FOOD_ONTOLOGY.find(n => n.id === id)),
  getFoodNodeChildren: (id: number) => Promise.resolve(FOOD_ONTOLOGY.filter(n => n.parent_id === id)),
  getFoodNodeParents: (id: number) => {
    const parents: FoodNode[] = [];
    let current = FOOD_ONTOLOGY.find(n => n.id === id);
    while (current && current.parent_id) {
      const parent = FOOD_ONTOLOGY.find(n => n.id === current?.parent_id);
      if (parent) {
        parents.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return Promise.resolve(parents);
  },

  // Weighted Search for Food Nodes
  searchNodes: (query: string) => {
    const q = query.toLowerCase();
    const results = FOOD_ONTOLOGY.map(node => {
      let score = 0;
      if (node.name.toLowerCase() === q) score += 100; // Exact match
      else if (node.name.toLowerCase().startsWith(q)) score += 50; // Starts with
      else if (node.name.toLowerCase().includes(q)) score += 20; // Contains
      if (node.description?.toLowerCase().includes(q)) score += 5;
      return { node, score };
    })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.node);
    return Promise.resolve(results);
  },

  checkInventoryMatch: (requiredId: number, pantry: PantryItem[]) => {
    const requiredNode = FOOD_ONTOLOGY.find(n => n.id === requiredId);
    if (!requiredNode) return false;
    return pantry.some(item => {
      const pantryNode = FOOD_ONTOLOGY.find(n => n.id === item.food_node_id);
      if (!pantryNode) return false;
      return pantryNode.path.startsWith(requiredNode.path);
    });
  },

  getRecipes: () => Promise.resolve(RECIPES),

  getRecipe: (id: number) => Promise.resolve(RECIPES.find(r => r.id === id)),

  addRecipe: (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe = { ...recipe, id: Date.now() };
    RECIPES.push(newRecipe);
    return Promise.resolve(newRecipe);
  },

  // Weighted Search for Recipes
  searchRecipes: (query: string, filters: any = {}) => {
    const q = query.toLowerCase();

    // Step 1: Filter by Criteria
    let filtered = RECIPES.filter(r => {
      if (filters.cuisine && r.cuisine !== filters.cuisine) return false;
      if (filters.maxTime && (r.prep_time + r.cook_time) > filters.maxTime) return false;
      if (filters.maxCalories && r.calories > filters.maxCalories) return false;
      if (filters.dietary && filters.dietary.length > 0) {
        // Must contain ALL selected dietary tags
        const hasTags = filters.dietary.every((tag: string) => r.tags.includes(tag));
        if (!hasTags) return false;
      }
      return true;
    });

    // Step 2: Weighted Text Search
    if (!q) return Promise.resolve(filtered);

    const scored = filtered.map(recipe => {
      let score = 0;
      if (recipe.title.toLowerCase().includes(q)) score += 10;
      if (recipe.description.toLowerCase().includes(q)) score += 5;
      if (recipe.cuisine.toLowerCase().includes(q)) score += 8;

      // Fuzzy Ingredient Match (Check food ontology names)
      const ingredientMatch = recipe.ingredients.some(ing => {
        const node = FOOD_ONTOLOGY.find(n => n.id === ing.food_node_id);
        return node?.name.toLowerCase().includes(q);
      });
      if (ingredientMatch) score += 15; // High relevance if searching by ingredient

      return { recipe, score };
    })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.recipe);

    return Promise.resolve(scored);
  },

  getRecipeReviews: (recipeId: number) => {
    return Promise.resolve(INITIAL_REVIEWS.filter(r => r.recipe_id === recipeId));
  },
  addReview: (review: Omit<Review, 'id' | 'date'>) => {
    const newReview = { ...review, id: Date.now(), date: new Date().toISOString().split('T')[0] };
    INITIAL_REVIEWS.unshift(newReview);
    return Promise.resolve(newReview);
  },

  getPantry: () => {
    const data = localStorage.getItem('foodgenie_pantry');
    return Promise.resolve(data ? JSON.parse(data) : INITIAL_PANTRY);
  },
  addToPantry: (item: Omit<PantryItem, 'id'>) => {
    const data = localStorage.getItem('foodgenie_pantry');
    const current = data ? JSON.parse(data) : INITIAL_PANTRY;
    const newItem = { ...item, id: Date.now() };
    const updated = [...current, newItem];
    localStorage.setItem('foodgenie_pantry', JSON.stringify(updated));
    return Promise.resolve(newItem);
  },
  removeFromPantry: (id: number) => {
    const data = localStorage.getItem('foodgenie_pantry');
    const current = data ? JSON.parse(data) : INITIAL_PANTRY;
    const updated = current.filter((i: PantryItem) => i.id !== id);
    localStorage.setItem('foodgenie_pantry', JSON.stringify(updated));
    return Promise.resolve(true);
  },

  getShoppingList: () => {
    const data = localStorage.getItem('foodgenie_shoppinglist');
    return Promise.resolve(data ? JSON.parse(data) : INITIAL_SHOPPING_LIST);
  },
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => {
    const data = localStorage.getItem('foodgenie_shoppinglist');
    const current = data ? JSON.parse(data) : INITIAL_SHOPPING_LIST;
    const newItem = { ...item, id: Date.now(), checked: false };
    const updated = [...current, newItem];
    localStorage.setItem('foodgenie_shoppinglist', JSON.stringify(updated));
    return Promise.resolve(newItem);
  },
  toggleShoppingItem: (id: number) => {
    const data = localStorage.getItem('foodgenie_shoppinglist');
    const current = data ? JSON.parse(data) : INITIAL_SHOPPING_LIST;
    const updated = current.map((i: ShoppingItem) => i.id === id ? { ...i, checked: !i.checked } : i);
    localStorage.setItem('foodgenie_shoppinglist', JSON.stringify(updated));
    return Promise.resolve(true);
  },
  deleteShoppingItem: (id: number) => {
    const data = localStorage.getItem('foodgenie_shoppinglist');
    const current = data ? JSON.parse(data) : INITIAL_SHOPPING_LIST;
    const updated = current.filter((i: ShoppingItem) => i.id !== id);
    localStorage.setItem('foodgenie_shoppinglist', JSON.stringify(updated));
    return Promise.resolve(true);
  },
  clearCompletedShoppingItems: () => {
    const data = localStorage.getItem('foodgenie_shoppinglist');
    const current = data ? JSON.parse(data) : INITIAL_SHOPPING_LIST;
    const updated = current.filter((i: ShoppingItem) => !i.checked);
    localStorage.setItem('foodgenie_shoppinglist', JSON.stringify(updated));
    return Promise.resolve(true);
  },

  getMealPlan: () => {
    const data = localStorage.getItem('foodgenie_mealplan');
    return Promise.resolve(data ? JSON.parse(data) : INITIAL_MEAL_PLAN);
  },
  addToMealPlan: (item: Omit<MealPlanItem, 'id'>) => {
    const data = localStorage.getItem('foodgenie_mealplan');
    const current = data ? JSON.parse(data) : INITIAL_MEAL_PLAN;
    const filtered = current.filter((i: MealPlanItem) => !(i.day === item.day && i.slot === item.slot));
    const newItem = { ...item, id: Date.now() };
    const updated = [...filtered, newItem];
    localStorage.setItem('foodgenie_mealplan', JSON.stringify(updated));
    return Promise.resolve(newItem);
  },
  removeFromMealPlan: (id: number) => {
    const data = localStorage.getItem('foodgenie_mealplan');
    const current = data ? JSON.parse(data) : INITIAL_MEAL_PLAN;
    const updated = current.filter((i: MealPlanItem) => i.id !== id);
    localStorage.setItem('foodgenie_mealplan', JSON.stringify(updated));
    return Promise.resolve(true);
  },

  getFriends: () => Promise.resolve(FRIENDS),
  getActivities: () => Promise.resolve(ACTIVITIES),
  searchUsers: (query: string) => {
    const q = query.toLowerCase();
    const matches = USERS.filter(u => u.id !== 1 && u.name.toLowerCase().includes(q));
    return Promise.resolve(matches);
  },
  sendFriendRequest: (userId: number) => {
    return Promise.resolve(true);
  },

  getUserProfile: (id: number) => {
    const user = USERS.find(u => u.id === id) || USERS[0];
    return Promise.resolve(user);
  },
  updateProfile: (id: number, data: Partial<User>) => {
    const index = USERS.findIndex(u => u.id === id);
    if (index !== -1) {
      USERS[index] = { ...USERS[index], ...data };
    }
    return Promise.resolve(USERS[index]);
  },

  // --- AI/OCR Mock Services ---

  // Mock Receipt Parsing
  parseReceipt: (imageBlob: any) => {
    // Simulating delay
    return new Promise<ShoppingItem[]>((resolve) => {
      setTimeout(() => {
        // Mock detected items
        resolve([
          { id: 101, food_node_id: 12, name: "Whole Milk", quantity: 1, unit: "gallon", checked: false, category: "Dairy" },
          { id: 102, food_node_id: 4, name: "Organic Eggs", quantity: 12, unit: "large", checked: false, category: "Dairy" },
          { id: 103, food_node_id: 31, name: "Yellow Onions", quantity: 3, unit: "pcs", checked: false, category: "Produce" }
        ]);
      }, 2000);
    });
  },

  // Mock Object Detection (for Video/Camera)
  detectFoodObject: () => {
    // Randomly return a food node from ontology to simulate detection
    const randomIndex = Math.floor(Math.random() * FOOD_ONTOLOGY.length);
    const node = FOOD_ONTOLOGY[randomIndex];
    return Promise.resolve(node);
  },

  // Mock Recipe OCR
  ocrRecipe: (imageBlob: any) => {
    return new Promise<Partial<Recipe>>((resolve) => {
      setTimeout(() => {
        resolve({
          title: "Scanned Grandma's Lasagna",
          description: "Classic family recipe scanned from handwritten card.",
          prep_time: 45,
          cook_time: 60,
          servings: 8,
          ingredients: [
            { food_node_id: 27, quantity: 500, unit: 'g' }, // Pasta
            { food_node_id: 13, quantity: 2, unit: 'cups' }, // Cheese
            { food_node_id: 36, quantity: 4, unit: 'whole' } // Tomato
          ],
          tags: ["Family Secret", "Italian"]
        });
      }, 2500);
    });
  }
};